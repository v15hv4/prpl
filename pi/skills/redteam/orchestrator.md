# Red Team Orchestrator Workflow

The orchestrator follows a strict five-stage loop for each phase:

1. **Plan (LLM-assisted):** read `roe.yml`, `session.json`, `work.md` tail, phase skill, and hard-coded phase registry. Produce rationale, parallel groups, expected outputs, and coverage gaps. The extension validates the resulting deterministic wrapper list against RoE and dependencies.
2. **Execute (deterministic TypeScript harness):** run only registered wrappers. Enforce timeouts, retries, concurrency, resource limits, path exclusions, and missing-tool degradation.
3. **Gather:** write `command.json`, `stdout.txt`, `stderr.txt`, `result.json`, and `exit.json`; append output index entries; delete or redact raw sensitive data after normalized parsing.
4. **Infer (LLM-assisted + deterministic heuristics):** identify findings, candidate targets, false positives, and next steps from normalized evidence only.
5. **Branch:** complete, complete with warnings, skip by RoE, block on dependencies/secrets/tools, record candidates for later approval, or generate report.

Never probe runtime-discovered different-host candidates during the same execution pass. Never treat scanner output as verified without corroboration. Never mutate prior `work.md` entries.
