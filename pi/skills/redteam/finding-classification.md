# Finding Classification

Severity guidance:
- **Critical:** unauthenticated RCE, full database/customer data exposure, admin takeover, unauthenticated cloud/control-plane compromise, public write access to critical infrastructure.
- **High:** BOLA/IDOR exposing sensitive user/tenant data, broken collection access, SQL injection with DB enumeration, SSRF to sensitive internal services, admin function accessible to regular users.
- **Medium:** exploitable CORS without broad data exposure, XSS with realistic impact, exposed debug/staging with limited data, sensitive source maps, weak TLS with compatibility impact.
- **Low:** verbose headers, missing hardening headers, version disclosure, login panel exposure with no bypass.
- **Info:** third-party inventory, split-horizon DNS leakage, architecture notes, properly blocked controls.

A final finding requires evidence and reproducible impact. Scanner-only results remain triage until validated. If evidence contains PII/secrets, store only redacted minimal proof.
