import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { RoeSpec, SessionState, PhaseDef, PhaseStatus, ToolInvocation, ToolRunResult } from "./types";
import { runToolBatch } from "./tool_runner";
import { appendWork, rel, saveSession } from "./session_state";
import { inferPhase } from "./inference";
import { checkGate } from "./planner";
import { generateReport } from "./report";
import { llmInfer, llmPlan } from "./llm";

const MAX_ITERATIONS = 3;

export async function runPhaseLoop(dir: string, roe: RoeSpec, session: SessionState, phase: PhaseDef, llmCtx?: any) {
  const gate = checkGate(phase, roe, session);
  if (gate) { await setPhaseStatus(dir, session, phase, gate.status, gate.note); return `Phase ${phase.id} ${phase.name}: ${gate.status} (${gate.note})`; }
  await setPhaseStatus(dir, session, phase, "running", `phase started; skill=${phase.skill}; steps=${phase.steps.join(" > ")}`);

  const allResults: ToolRunResult[] = [];
  let totalFindings = 0;
  const executed = new Set<string>();
  let branch = "start";

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const workTail = (await readFile(join(dir, "work.md"), "utf8").catch(() => "")).split(/\n/).slice(-120).join("\n");
    await appendWork(dir, `\n## ${new Date().toISOString()} — Plan requested (iteration ${iteration})\n- Phase: ${phase.id} ${phase.name}\n- Branch reason: ${branch}\n- Context: session.json + immutable roe.yml + work.md tail (${workTail.length} chars) + ${phase.skill}\n- Safety: scope planning only; discovered hosts remain candidates until approved\n`);

    const availableTools = await phase.plan(roe, session, dir);
    const planRationale = await llmPlan(llmCtx, phase, roe, session, availableTools);
    const planned = applyLlmSelection(availableTools, planRationale).filter((t) => !executed.has(signature(t)));
    await appendWork(dir, `\n## ${new Date().toISOString()} — LLM plan rationale (iteration ${iteration})\n\`\`\`json\n${planRationale}\n\`\`\`\n`);
    await appendWork(dir, `\n## ${new Date().toISOString()} — Validated tool plan produced (iteration ${iteration})\n${planned.length ? planned.map((t, i) => `- ${i + 1}. ${t.name}: ${t.command ? `${t.command} ${t.args.join(" ")}` : t.execute ? "typescript wrapper" : "structured wrapper"}`).join("\n") : "- No new tool invocations after de-duplication"}\n`);

    if (planned.length === 0) { branch = "no_new_work"; break; }
    planned.forEach((t) => executed.add(signature(t)));
    const results = await runToolBatch(dir, phase.id, planned, roe.rate_limits.concurrent_hosts || 2, roe.rate_limits.requests_per_second || 1);
    allResults.push(...results);
    session.output_index.push(...results.map((r) => ({ phase: phase.id, tool: r.tool, dir: rel(dir, r.outDir), success: r.success, summary: r.summary, raw_retained: r.rawRetained })));
    await appendWork(dir, `\n## ${new Date().toISOString()} — Gather completed (iteration ${iteration})\n${results.map((r) => `- ${r.tool}: ${r.success ? "success" : "warning/fail"}; ${rel(dir, r.outDir)}; ${r.summary}`).join("\n")}\n`);

    const llmInference = await llmInfer(llmCtx, phase, roe, session, results);
    await appendWork(dir, `\n## ${new Date().toISOString()} — LLM inference (iteration ${iteration})\n\`\`\`json\n${llmInference}\n\`\`\`\n`);
    const findings = await inferPhase(dir, phase.id, roe, session, results, llmInference);
    totalFindings += findings.length;
    const decision = branchDecision(llmInference, session, iteration);
    branch = decision.reason;
    await appendWork(dir, `\n## ${new Date().toISOString()} — Branch decision (iteration ${iteration})\n- Decision: ${decision.action}\n- Reason: ${decision.reason}\n- Findings created this iteration: ${findings.map((f) => f.id).join(", ") || "none"}\n- Candidate targets pending approval: ${session.candidates.filter((c) => !c.approved).length}\n`);
    await saveSession(dir, session);
    if (decision.action !== "replan") break;
  }

  const meaningful = allResults.filter((r) => !r.missing).length;
  const successes = allResults.filter((r) => r.success).length;
  const status: PhaseStatus = meaningful === 0 && phase.id !== 14 ? "BLOCKED_MISSING_TOOLS" : successes < allResults.length ? "COMPLETE_WITH_WARNINGS" : "COMPLETE";
  if (phase.id === 14) await generateReport(dir, roe, session, undefined, llmCtx);
  if (phase.id === 14 && status === "COMPLETE") session.status = "complete";
  await setPhaseStatus(dir, session, phase, status, `${successes}/${allResults.length} wrappers succeeded over iterative loop; ${totalFindings} findings; ${session.candidates.filter((c) => !c.approved).length} pending candidates; final branch=${branch}`);
  return `Phase ${phase.id} ${phase.name}: ${status} (${successes}/${allResults.length} tools succeeded)`;
}

function applyLlmSelection(available: ToolInvocation[], planText: string) {
  try { const parsed = JSON.parse(planText.replace(/^```json\s*|```$/g, "")); const selected = Array.isArray(parsed.selected_tools) ? parsed.selected_tools.map(String) : []; if (selected.length) { const filtered = available.filter((t) => selected.includes(t.name)); if (filtered.length) return filtered; } } catch {}
  return available;
}
function branchDecision(llmInference: string, session: SessionState, iteration: number): { action: "replan" | "complete" | "await_approval"; reason: string } {
  let parsed: any = {}; try { parsed = JSON.parse(llmInference.replace(/^```json\s*|```$/g, "")); } catch {}
  const pending = session.candidates.filter((c) => !c.approved).length;
  const gaps = Array.isArray(parsed.coverage_gaps) ? parsed.coverage_gaps.filter(Boolean) : [];
  const next = JSON.stringify(parsed.next_steps ?? []).toLowerCase();
  if (pending && /approve|candidate|scope/.test(next)) return { action: "await_approval", reason: `${pending} candidate targets await explicit approval` };
  if (iteration < MAX_ITERATIONS && (gaps.length > 0 || /re-?run|replan|expand|coverage/.test(next))) return { action: "replan", reason: gaps[0] ? `coverage gap: ${gaps[0]}` : "LLM requested expanded coverage" };
  return { action: "complete", reason: gaps.length ? `remaining gaps recorded: ${gaps.join("; ")}` : "no further branch requested" };
}
function signature(t: ToolInvocation) { return JSON.stringify({ name: t.name, args: t.args, input: t.input, command: t.command }); }
async function setPhaseStatus(dir: string, session: SessionState, phase: PhaseDef, status: PhaseStatus, note: string) { const now = new Date().toISOString(); session.phases[String(phase.id)] = { status, updated_at: now, notes: [note], coverage: { steps: phase.steps, iterative: true, max_iterations: MAX_ITERATIONS } }; session.current_phase = phase.id; if (status === "running") session.status = "running"; if (status === "FAILED") session.status = "failed"; await saveSession(dir, session); await appendWork(dir, `\n## ${now} — Phase ${phase.id} ${status}\n- Phase: ${phase.name}\n- ${note}\n`); }
