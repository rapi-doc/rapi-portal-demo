# Authentication & Authorization

All requests to protected Cosmo Cargo APIs must be authenticated. There are two schemes, depending on what is calling.

---

## 1. Bearer Token (Apps and Shipper Portals)

For mobile apps and customer-facing frontends, pass a signed JSON Web Token (JWT) in the HTTP `Authorization` header. Get one from `POST /oauth/token`:

```http
GET /v1/shipments HTTP/1.1
Host: api.sh.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. API Key Header (Server-to-Server)

For backend services, spaceport dock systems and webhook management, pass your secret API key in the `X-API-Key` header:

```http
POST /v1/webhooks HTTP/1.1
Host: api.sh.example.com
X-API-Key: cc_secret_live_998877665544332211
Content-Type: application/json
```

---

## Security Best Practices

:::lock{title="Keep live keys secret"}

Never expose secret keys in client-side code, Git commits, or public repositories. Always use environment variables (e.g. `COSMO_CARGO_API_KEY`) to supply credentials to your servers.

:::
