# Phase 8: Cloud and Infrastructure

Cloud metadata tests are only valid through a confirmed SSRF. Do not request metadata directly from external hosts. Kubernetes/container checks may safely request `/version`, `/api`, or health endpoints once host/port is in scope. Any unauthenticated control-plane response is high/critical and must be proven minimally.
