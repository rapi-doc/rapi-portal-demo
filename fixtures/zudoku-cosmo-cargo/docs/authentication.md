# Authentication & Authorization

All requests to protected BrewCraft APIs must be authenticated. We support two authentication schemes depending on your integration type.

---

## 1. Bearer Token (Customer & Mobile Integrations)

For mobile client apps and customer-facing frontends, pass a signed JSON Web Token (JWT) in the HTTP `Authorization` header:

```http
GET /v1/orders HTTP/1.1
Host: api.brewcraft.io
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. API Key Header (Server-to-Server)

For backend service-to-service communication, webhooks, or point-of-sale (POS) systems, pass your secret API key in the `X-BrewCraft-Secret` header:

```http
POST /v1/payments/intents HTTP/1.1
Host: api.brewcraft.io
X-BrewCraft-Secret: bc_secret_live_998877665544332211
Content-Type: application/json
```

---

## Security Best Practices

:::lock{title="Keep live keys secret"}

Never expose secret keys in client-side code, Git commits, or public repositories. Always use environment variables (e.g. `BREWCRAFT_API_KEY`) to supply credentials to your servers.

:::
