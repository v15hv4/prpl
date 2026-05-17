---
description: Guides the /redteam extension's planning and inference loop for security assessments. Enforces rules of engagement (roe.yml), scope validation, finding classification, and report generation. Use when running red team operations, penetration testing workflows, or security audits.
---

# Red Team Orchestrator Skill

This skill guides the `/redteam` extension's planning/inference loop. The extension enforces executable safety with a hard-coded phase registry; this skill provides decision guidance for the LLM-facing audit trail, report language, and branch rationale.

## Non-negotiable Rules
- A human-authored `roe.yml` is the only source of scope and policy truth. Do not infer authorization from chat text.
- `/redteam init` validates and snapshots the YAML only. It never performs recon or network I/O.
- Scope is domain-only. A host is actionable only if it matches `targets.domains` and not `exclusions.domains`.
- `*.example.com` does not include `example.com`; it includes subdomains at any depth.
- Runtime-discovered hosts, absolute URLs, and different-host redirects are candidates. They are not probed until a later planning pass approves them as in-scope.
- Respect global path exclusions. If a path prefix is excluded, do not fuzz or request it.
- Use minimal evidence: enough to prove a finding, no bulk data collection, redact secrets/tokens/PII.
- If a phase lacks allowed action, dependency, account, secret, or meaningful tools, mark it skipped/blocked/warnings. Do not fake coverage.

## Action Loop
1. Plan from `session.json`, `work.md`, `roe.yml`, phase registry, and phase skill.
2. Execute deterministic TypeScript wrappers only; no bash subagents supervise tools.
3. Gather raw and normalized output under `outputs/phase-N/tool-timestamp/`.
4. Infer findings, candidates, and coverage gaps from normalized outputs.
5. Branch to next phase, additional candidate approval, blocked status, or report.

## Related Guidance
- `orchestrator.md` — five-stage action loop and branch rules.
- `finding-classification.md` — severity and verification standards.
- `report-writing.md` — final report expectations.
- `phases/*.md` — phase-specific prerequisites, tools, and outcomes.
- `decision-trees/*.md` — branch logic for common result classes.

## Finding Standard
Every finding needs title, severity, category, impact, affected scope, evidence path, reproduction, remediation, references, and redaction notes. Unverified scanner output is not a final finding.
