# Phase 7: Transport, CORS, and Origin Trust

CORS critical path: reflected arbitrary `Origin` plus `Access-Control-Allow-Credentials: true`. Test `null`, scheme changes, sibling domains, and suffix regex bypasses. TLS checks include deprecated protocols, weak ciphers, expired certificates, and HSTS. Request smuggling/cache poisoning are high-risk and must obey RoE timing and rate limits.
