# Subdomain Outcome Decision Tree

- Matches target and not excluded: eligible for planning.
- Different-host redirect or JS absolute URL: candidate target only; wait for later approval.
- Private/RFC1918 DNS answer: split-horizon informational; skip external active probing.
- Staging/dev/preview/admin naming: prioritize but still require scope match.
- Dangling CNAME/cloud default page: takeover candidate; do not claim resource.
- Wildcard DNS: verify nonce response and filter wildcard noise before active phase.
