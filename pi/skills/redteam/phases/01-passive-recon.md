# Phase 1: Passive Reconnaissance

Goal: build the target footprint without sending traffic to target infrastructure.

Tools/wrappers: `rt_whois`, `rt_subdomain_enum_crtsh`, `rt_subdomain_enum_subfinder`, `rt_subdomain_enum_amass`, `rt_shodan_query`, `rt_wayback`, `rt_gau`, `rt_breach_check`, `rt_third_party_detect_txt`, `rt_third_party_detect_mx`.

Branches:
- Internal/staging/admin/grafana/jenkins/vpn/k8s names: record priority for active recon; do not probe in this phase.
- Private RFC1918 resolution hints: later document split-horizon; do not attempt internal access.
- Cloud provider CNAMEs: queue takeover checks in active phase; do not claim resources.
- Leaked credentials: only test if RoE explicitly permits and accounts are test accounts; otherwise informational risk.
- Third-party indicators (Auth0, Okta, Stripe, PostHog, Sentry, Datadog, Slack): queue phase 10 service-specific checks.
Done when all passive sources either produced normalized output or a missing-tool warning.
