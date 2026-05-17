#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/roe.yml" <<'YAML'
assessment_name: "Verification VAPT"
targets:
  domains:
    - example.com
    - "*.example.com"
allowed_actions:
  - passive_recon
  - active_recon
  - vulnerability_scanning
  - third_party_testing
  - cloud_testing
rate_limits:
  requests_per_second: 2
  concurrent_hosts: 2
exclusions:
  domains:
    - excluded.example.com
  paths:
    - /dangerous-action
YAML
pi -e "$ROOT_DIR/extension/index.ts" --no-extensions --no-skills --no-prompt-templates --offline -p "/redteam init $TMP/roe.yml" >/dev/null
session_dir="$(find "$HOME/.prpl/redteam/sessions" -maxdepth 2 -type f -name session.json -printf '%T@ %h\n' | sort -n | tail -1 | cut -d' ' -f2-)"
sid="$(basename "$session_dir")"
test -f "$session_dir/roe.yml"
test -f "$session_dir/roe.sha256"
test -f "$session_dir/session.json"
test -f "$session_dir/work.md"
if grep -q "Phase 1 started" "$session_dir/work.md"; then echo "init unexpectedly started phase work" >&2; exit 1; fi
pi -e "$ROOT_DIR/extension/index.ts" --no-extensions --no-skills --no-prompt-templates --offline -p "/redteam phase $sid 1" >/dev/null
python - "$session_dir/session.json" <<'PY'
import json,sys
s=json.load(open(sys.argv[1]))
assert s['phases']['1']['status'] in ('COMPLETE','COMPLETE_WITH_WARNINGS'), s['phases']['1']
assert s['output_index'], 'missing output index'
assert all(o.get('raw_retained') is False for o in s['output_index']), 'raw output retained unexpectedly'
assert s.get('candidates'), 'passive discoveries should be recorded as candidates requiring approval'
assert all(c.get('approved') is False for c in s['candidates']), 'newly discovered candidates must not be auto-approved'
PY
pi -e "$ROOT_DIR/extension/index.ts" --no-extensions --no-skills --no-prompt-templates --offline -p "/redteam report $sid --output $TMP/report.md" >/dev/null
grep -q "Branch decision" "$session_dir/work.md"
grep -q "Coverage Metrics" "$TMP/report.md"
grep -q "Candidate Targets Not Probed" "$TMP/report.md"
echo "redteam verification passed for $sid"
