# Phase 13: Rate Limiting and Anti-automation

Start with single safe probes and escalate only inside RoE rate limits. Measure per-token, per-account, and per-IP limits on login, reset, signup, search, and expensive endpoints. Missing 429 on auth or expensive workflows is a finding. Do not create DoS conditions.
