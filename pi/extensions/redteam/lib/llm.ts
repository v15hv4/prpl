import { complete, type Message } from "@earendil-works/pi-ai";
import { PhaseDef, RoeSpec, SessionState, ToolInvocation, ToolRunResult } from "./types";

type LlmContext = { model?: any; modelRegistry?: any; signal?: AbortSignal };

async function callLlm(ctx: LlmContext | undefined, systemPrompt: string, text: string): Promise<string | undefined> {
  if (!ctx?.model || !ctx.modelRegistry) return undefined;
  const auth = await ctx.modelRegistry.getApiKeyAndHeaders(ctx.model);
  if (!auth.ok || !auth.apiKey) return undefined;
  const msg: Message = { role: "user", timestamp: Date.now(), content: [{ type: "text", text }] };
  const response = await complete(ctx.model, { systemPrompt, messages: [msg] }, { apiKey: auth.apiKey, headers: auth.headers, signal: ctx.signal });
  if (response.stopReason === "aborted") return undefined;
  return response.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n").trim();
}

export async function llmPlan(ctx: LlmContext | undefined, phase: PhaseDef, roe: RoeSpec, session: SessionState, deterministicPlan: ToolInvocation[]) {
  const text = await callLlm(ctx, `You are the /redteam planner. Return concise JSON with rationale, safety_notes, selected_tools, rejected_tools, parallel_groups, coverage_gaps. selected_tools must be chosen only from available_tool_invocations. Do not add out-of-scope targets.`, JSON.stringify({ phase: { id: phase.id, name: phase.name, steps: phase.steps }, roe: { targets: roe.targets, exclusions: roe.exclusions, allowed_actions: roe.allowed_actions, rate_limits: roe.rate_limits, accounts: Object.fromEntries(Object.entries(roe.accounts).map(([k,a]) => [k, { role: a.role, has_secret_ref: !!a.secret_ref }])) }, session: { phases: session.phases, candidates: session.candidates }, available_tool_invocations: deterministicPlan.map((t) => ({ name: t.name, command: t.command, args: t.args, input: t.input })) }, null, 2));
  return text ?? JSON.stringify({ rationale: "LLM unavailable; deterministic hard-coded safety plan used", selected_tools: deterministicPlan.map((t) => t.name), coverage_gaps: ["No LLM planner response recorded"] });
}

export async function llmInfer(ctx: LlmContext | undefined, phase: PhaseDef, roe: RoeSpec, session: SessionState, results: ToolRunResult[]) {
  const summarized = results.map((r) => ({ tool: r.tool, success: r.success, missing: r.missing, summary: r.summary, result: r.result }));
  const text = await callLlm(ctx, `You are the /redteam finding inference analyst. Return concise JSON: findings[], candidates[], next_steps[], coverage_gaps[]. Only infer from evidence. Redact secrets.`, JSON.stringify({ phase: { id: phase.id, name: phase.name, steps: phase.steps }, scope: roe.targets, exclusions: roe.exclusions, current_findings: session.findings_index, results: summarized }, null, 2));
  return text ?? JSON.stringify({ findings: [], candidates: [], next_steps: [], coverage_gaps: ["No LLM inference response recorded"] });
}

export async function llmReportReview(ctx: LlmContext | undefined, reportDraft: string) {
  return await callLlm(ctx, `You are a security report editor. Improve clarity and identify missing evidence without inventing findings.`, reportDraft.slice(0, 60000));
}
