# Phase 2: Active Reconnaissance

Goal: probe live infrastructure within RoE bounds.

Tools/wrappers: `rt_dns_resolve`, `rt_httpx_probe`, `rt_dns_brute`, `rt_port_scan`, `rt_whatweb`, `rt_wappalyzer`, `rt_content_discover`, `rt_js_analyze`, `rt_subjack`.

Safety:
- Only use approved in-scope hosts. Do not synthesize hosts unless wildcard scope and DNS discovery found them.
- Same-host redirects may be followed by wrappers. Different-host redirects are candidates only.
- Respect `rate_limits.concurrent_hosts` and `requests_per_second`.
- If path exclusions exist, broad fuzzing must filter or skip excluded prefixes.

Branches:
- Public datastore/Kubernetes/Docker/admin ports: high-priority finding candidate; validate with one harmless request.
- 401/403/405 routes: queue authorization and method testing.
- Staging/dev exposed: prioritize debug/source-map/API discovery.
- Dangling CNAME/provider defaults: report takeover candidate; do not claim.
