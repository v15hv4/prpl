# Phase 4: Vulnerability Scanning

Run scanner baselines such as nuclei only against approved live targets. Scanner output is triage data, not a finding until validated. Confirm version-based CVEs with safe checks. `.git`, `.env`, `phpinfo`, exposed backups, or secrets are high/critical trajectories; fetch the minimum proof and redact content.
