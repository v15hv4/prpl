# Port Scan Outcome Decision Tree

- Only 80/443: continue web/API testing.
- SSH exposed: fingerprint only; no brute force unless explicitly authorized.
- RDP/SMB/WinRM: high suspicion; pause for RoE confirmation before intrusive enumeration.
- Redis/Mongo/Elasticsearch/Memcached/Postgres/MySQL: validate reachability with one harmless command; no data enumeration.
- Kubernetes/Docker/etcd: request version/health only; unauthenticated control-plane response is high/critical.
- Admin/dev ports (8080/8443/9000/9090/3000): route to content/authz testing.
