# Content Discovery Outcome Decision Tree

- 200 unexpected JSON/system/user data: inspect minimally and create exposure/authz candidate.
- 301/302 to login: queue authenticated retest.
- 401/403: queue auth bypass and function-level authorization.
- 405: queue method enumeration.
- 402: queue business-logic/billing bypass.
- 5xx/stack trace: capture one proof; avoid repeated triggering.
- WAF 403 vs app 403: classify by headers/body before bypass attempts.
