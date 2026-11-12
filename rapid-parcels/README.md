# Rapid Parcels: RapiDoc demo portal

The reference demo and dogfooding project for **RapiDoc**, **`@rapidoc/cli`**, **`@rapidoc/portal`** and **`@rapidoc/server`**.

**Rapid Parcels** is a fictional parcel network. Its six APIs and its docs were written for RapiDoc's own test cases: public and protected APIs, sign-in with Auth0, read-versus-execute permissions, and spec features from webhooks to a 144-operation admin API. The scenario (roles, permissions, who sees what) is in the monorepo: `rapidoc/packages/rapidoc-portal/design/demo-scenario.md`.

All example hosts and addresses use the reserved domain `rapidparcels.example`; real services (test users, the Auth0 API identifier) use `rapidocui.com`.

---

## Repository structure

```text
rapid-parcels/
├── rapidoc.config.yaml      # Portal config: site, navigation, APIs, sign-in (auth) and access rules
├── specs/
│   ├── rates.yaml           # Public: no auth; examples everywhere (OpenAPI 3.1)
│   ├── shipments.yaml       # OAuth2 scopes, pagination, idempotency, error responses, 3.1 webhooks
│   ├── tracking.yaml        # OpenAPI 3.0: callbacks; OAuth2 or an API key
│   ├── carriers.yaml        # Multipart upload; oneOf + discriminator
│   ├── billing.yaml         # No examples at all: the mock generates data from schemas
│   └── admin.json           # 144 operations (generated), deep nesting, deprecated operations
├── scripts/generate-admin-spec.mjs   # Regenerates specs/admin.json
├── docs/                    # Public guides; shipping/, partners/, internal/ are protected
├── public/                  # Logos (light and dark) and the hero illustrations
├── styles/rapid-parcels.css # The portal's own touches (theme.css)
└── auth0-setup.md           # Checklist for the Auth0 tenant (roles, permissions, users, Action)
```

The other examples of this repository are `../bookstore/` (the smallest portal) and `../cosmo-cargo/` (Zudoku's demo, the monorepo's test fixture).

## Who can see what

| | Visitor | shipper | tracker | reviewer | carrier-partner | finance | platform-admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Public docs, Rates API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shipments API, shipping guides | 🔒 | ✅ | — | ✅ | — | — | ✅ |
| Tracking API | 🔒 | — | ✅ | ✅ | — | — | ✅ |
| Carrier Partners API, partner guides | 🔒 | — | — | ✅ | ✅ | — | ✅ |
| Billing API, internal runbooks | 🔒 | — | — | — | — | ✅ | ✅ |
| Admin API | 🔒 | — | — | — | — | — | ✅ |

Reading is decided by the portal (roles); calling an API is decided by the API's own permission check, so the reviewer reads most references but every call returns `403`.

---

## Local development

Built with the `rapidoc` CLI from the sibling monorepo checkout (`../rapidoc`), so it always uses that checkout's current code.

```bash
npm run dev        # dev server on http://localhost:4321 (access rules are not enforced in dev)
npm run build      # build into dist/ (split into dist/public and dist/protected, because of auth)
npm run validate   # validate every spec in apis:
npm run generate:admin   # regenerate specs/admin.json
```

### Serving with sign-in

Set up the Auth0 tenant with [`auth0-setup.md`](auth0-setup.md). Then copy `.env.example` to `.env` (git-ignored), fill in the client secret and a session secret (`openssl rand -hex 32`), and run:

```bash
npm run serve
```

and open http://localhost:8090. `npm run serve` loads `.env` (variables already set in your shell win). The client secret only ever lives in `.env` or your shell, never in a committed file.

### Hosting

The hosted demo ([parcels.rapidocui.com](https://parcels.rapidocui.com/)) runs `rapidoc serve` on a managed VPS sponsored by [Simafri](https://www.simafri.com/en/managed-vps/), next to `rapidoc mock` at `mock.rapidocui.com`. Both build with the published packages in `../deploy/`, not the monorepo, and are redeployed on every push to `main` by `.github/workflows/deploy-server.yml`. The server's layout, its settings file and how to add a domain are in [`../deploy/server/README.md`](../deploy/server/README.md).

To host it elsewhere, any machine that runs Node.js 22 will do:

1. **Build and serve:** `rapidoc build rapid-parcels`, then `rapidoc serve rapid-parcels/dist` behind HTTPS, with the variables of `.env.example` set in the environment (`RAPIDOC_PUBLIC_URL` is the address readers open).
2. **Auth0** (Applications → Rapid Parcels Portal → Settings): add `<your address>/_rapidoc/auth/callback` to Allowed Callback URLs and `<your address>/` to Allowed Logout URLs.
3. **The mock:** `rapidoc mock rapid-parcels` with `RAPIDOC_MOCK_ISSUER` and `RAPIDOC_MOCK_AUDIENCE` set, and its address as the first server of each spec.

### Calling the APIs

Signed in to the portal, **Try** sends your access token (`auth.tryIt`), so every call is answered by your role's permissions: 200, or 403 naming the missing permission.

Every spec lists the hosted mock first (`https://mock.rapidocui.com/<api id>`), then a local one (`http://localhost:4010/<api id>`); `https://api.rapidparcels.example/v1` is documentation only. To answer **Try** from your own machine, pick the local server in the API page and start the mock with:

```bash
npm run mock       # all six APIs on http://localhost:4010/<api id>
```

It answers with the specs' examples (Billing has none, so its data is generated) and enforces each operation's `security` like a real API: with `RAPIDOC_MOCK_ISSUER` and `RAPIDOC_MOCK_AUDIENCE` set (see `.env.example`), a call needs an Auth0 access token for `https://api.rapidocui.com` whose `permissions` include the operation's scope (`shipments:read`, …): no or invalid token → 401, token without the permission → 403. Tracking also accepts any `X-Api-Key`; Rates is open. `Prefer: code=404` returns a documented error response.

### The Zudoku fixture

`../cosmo-cargo/` holds the previous demo, built on Zudoku's Cosmo Cargo example (© Zuplo, MIT; see its `LICENSE-ZUDOKU.md`). The monorepo tests load and build it, so don't rename its files without updating them; see its README.

### Keeping in sync with `@rapidoc/portal`

When the portal's config structure, Markdoc tags or CLI commands change, update `rapidoc.config.yaml` and `docs/` here (and the fixture if the tests need it), then run `npm run test:portal` in the monorepo.

`dist/` and `.rapidoc-temp/` are gitignored build output.
