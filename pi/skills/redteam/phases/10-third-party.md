# Phase 10: Third-party Integrations

For each discovered service, test only integration boundaries: OAuth redirect allowlists/state/nonce/PKCE, billing webhook signatures/idempotency/cross-tenant checkout, analytics write-key and feature-flag leakage, status-page endpoint disclosure, Sentry/Datadog DSN submission risk. Public client IDs are informational unless they enable abuse.
