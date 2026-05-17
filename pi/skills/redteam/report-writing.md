# Report Writing Guidance

Write for engineering and executive readers. Lead with business impact, then technical proof.

Each finding must include:
1. Title and severity.
2. Affected endpoint/host/scope.
3. Impact in plain language.
4. Minimal reproduction steps with safe test accounts.
5. Evidence paths and small redacted snippets only.
6. Root cause when supported by evidence.
7. Concrete remediation.
8. References (OWASP API Top 10, CWE, vendor docs).
9. Zero-retention/redaction note.

Report coverage honestly: skipped by RoE, blocked by missing secrets/tools, and pending candidate targets are explicit gaps. Do not imply that a control was tested when its phase was skipped or blocked.
