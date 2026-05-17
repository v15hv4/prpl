# Authorization Bypass Outcome Decision Tree

- 403/404 for peer account: expected; continue other endpoints.
- 200 with another user's object: BOLA/IDOR high or critical depending data/write access.
- Listing returns all tenants/users/orders: broken collection access; quantify minimally.
- Regular user receives admin-shaped response: broken function-level authorization.
- Canonical path 403 but encoded/header/method variant 200: routing/normalization bypass.
- 302 to login: re-check token validity before concluding protection.
