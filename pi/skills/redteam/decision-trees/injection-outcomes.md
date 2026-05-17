# Injection Testing Outcome Branches

This decision tree guides next steps after injection testing (Phase 6).

## XSS Testing Outcomes

| Response | Meaning | Action |
|----------|---------|--------|
| Alert fired / payload reflected unencoded | **XSS Confirmed** | Document severity (stored > reflected); test escalation |
| Payload encoded but partial bypass works | XSS with bypass | Document WAF/filter details; test alternate vectors |
| All payloads sanitized | No XSS found | Move to next endpoint; note input validation |
| 403/WAF blocked | Blocked by WAF | Note WAF vendor; test bypass techniques |

## SQL Injection Outcomes

| Response | Meaning | Action |
|----------|---------|--------|
| Error-based disclosure | **SQLi Confirmed** | Document DBMS; avoid extraction beyond proof |
| Time-based response delay | Blind SQLi | Document timing; single confirmation query only |
| Boolean-based difference | Boolean SQLi | Document differential; single confirmation only |
| No response variation | No SQLi found | Move to next parameter |

## SSRF Testing Outcomes

| Response | Meaning | Action |
|----------|---------|--------|
| Callback received from target IP | **SSRF Confirmed** | Document internal access scope; test metadata endpoints once |
| Metadata endpoint response | **SSRF to cloud metadata** | Document credentials exposure; do not exfiltrate |
| Internal service response | **SSRF to internal service** | Document reachability; note service type |
| No callback received | No SSRF or blocked | Test alternate schemes (file://, gopher://) if RoE permits |

## Next Phase Triggers

Proceed to Phase 7 when:
- All injection vectors tested against parameterized endpoints
- Findings documented with minimal reproduction evidence
- No active exploitation beyond proof-of-concept
