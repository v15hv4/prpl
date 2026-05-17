# /redteam PRD Implementation Checklist

This file maps `.docs/PRD-redteam.md` requirements to concrete artifacts.

## Command Interface
- `/redteam init ./roe.yml`: `extensions/redteam/extension.ts:init`
- `/redteam phase {session_id} N`: `extension.ts:phase`, `lib/action_loop.ts`
- `/redteam auto {session_id}`: `extension.ts:auto`
- `/redteam resume {session_id}`: `extension.ts:resume`
- `/redteam status {session_id}`: `extension.ts:status`
- `/redteam report {session_id} --output report.md`: `extension.ts:report`, `lib/report.ts`
- Candidate approval for discovered hosts: `extension.ts:approve`

## RoE and Session State
- Strict `roe.yml` parsing/validation/normalization: `lib/roe.ts`
- Domain-only scope, wildcard semantics, exclusions, path-prefix handling: `lib/scope.ts`, `lib/planner.ts`
- Immutable session snapshot and hash verification: `lib/session_state.ts`, `extension.ts`
- Session layout under `~/.prpl/redteam/sessions/{session_id}` with `roe.yml`, `roe.sha256`, `session.json`, `work.md`, `outputs/`, `findings/`, `reports/`: `extension.ts:init`, `lib/tool_runner.ts`, `lib/report.ts`
- Append-only `work.md`: `lib/session_state.ts:appendWork`, `lib/action_loop.ts`

## Agentic Action Loop
- LLM-assisted planning with selected tool validation: `lib/llm.ts:llmPlan`, `lib/action_loop.ts:applyLlmSelection`
- Iterative Plan → Execute → Gather → Infer → Branch loop (max bounded iterations per phase, de-duplicated tool signatures, replan branch on LLM coverage gaps): `lib/action_loop.ts`
- Deterministic execution harness: `lib/tool_runner.ts`, `lib/parallel_runner.ts`
- Idempotent gather/output index: `lib/action_loop.ts`, `lib/tool_runner.ts`
- LLM-assisted inference plus deterministic safety heuristics: `lib/llm.ts:llmInfer`, `lib/inference.ts`
- Branch/phase status transitions: `lib/action_loop.ts`, `lib/planner.ts:checkGate`

## Phase Registry and Gating
- Hard-coded phases 1–14 with allowed actions, dependencies, and account requirements: `lib/planner.ts:PHASES`
- Missing action/dependency/secret/account/tool status handling: `lib/planner.ts:checkGate`, `lib/tool_runner.ts`
- Full-auto semantics: `extension.ts:auto`

## Deterministic Tool Wrappers
- Passive recon: `tools/rt_whois.ts`, `rt_subdomain_enum.ts`, `rt_misc.ts`
- Active recon: `rt_dns_resolve.ts`, `rt_httpx_probe.ts`, `rt_port_scan.ts`, `rt_content_discover.ts`, `rt_js_analyze.ts`
- Vulnerability scanning: `rt_nuclei_scan.ts`
- Authorization: `rt_auth_diff.ts`, `rt_specialized.ts:rt_ato_test`
- Injection/SSRF/JWT/API: `rt_specialized.ts`
- CORS/TLS/rate limit: `rt_cors_test.ts`, `rt_tls_audit.ts`, `rt_rate_limit_probe.ts`
- Reporting: `rt_report_gen.ts`, `lib/report.ts`

## Safety and Data Handling
- Runtime-discovered hosts, including in-scope passive subdomains, are candidates only until explicit approval: `lib/inference.ts`, `lib/scope.ts`, `extension.ts:approve`
- Admin panel probing does not fabricate hosts: `lib/planner.ts:planAdminPanels`
- Path exclusions filtered before content discovery: `tools/rt_content_discover.ts`
- Timeouts, retries, concurrency limits: `lib/tool_runner.ts`, `lib/action_loop.ts`
- Zero-retention/redaction default for raw outputs: `lib/tool_runner.ts`, `lib/parsers.ts`

## Skills and Methodology
- Main skill and orchestrator: `skills/redteam/SKILL.md`, `skills/redteam/orchestrator.md`
- Phase skills: `skills/redteam/phases/*.md`
- Decision trees: `skills/redteam/decision-trees/*.md`
- Finding/report templates: `skills/redteam/finding-classification.md`, `report-writing.md`, `templates/*.md`

## Verification
- Smoke verifier: `extensions/redteam/verify.sh`
- The verifier asserts init does not start phases, required session files exist, phase 1 reaches COMPLETE/COMPLETE_WITH_WARNINGS (not BLOCKED), candidates are recorded but not auto-approved, raw outputs are not retained, branch decisions are logged, and the report contains coverage metrics and candidate-target sections.
