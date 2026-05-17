# Phase 5: Authorization Testing

Requires two standard test accounts. Highest-yield phase.

Steps:
1. Configure two-account diffing with captured tokens for user A and user B.
2. For each endpoint with object IDs, replay user A resource requests using user B token.
3. Test collection endpoints for tenant/user scoping.
4. Test admin/function endpoints with regular user token.
5. Try path normalization, header smuggling (`X-Original-URL`), method override, and versioned-path variants on 401/403 endpoints.
6. Test token rotation, email change, reset flow, and account takeover workflows using test accounts only.

Outcomes: 403/404 is expected; 200 with other-user data is BOLA/IDOR; all-record collection access is critical/high; admin-shaped data to regular user is broken function-level authorization.
