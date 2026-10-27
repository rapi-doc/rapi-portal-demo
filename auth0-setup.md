# Auth0 setup for the Rapid Parcels demo

A checklist for the `rapidocui` Auth0 tenant (`https://rapidocui.us.auth0.com/`). It sets up the people, roles and permissions from the scenario (`astro-rapidoc/packages/rapidoc-portal/design/demo-scenario.md`, sections 4–6).

Two things come out of a sign-in, and they are set up separately:

- **Roles** → the ID token's `https://rapidoc/roles` claim → what the portal lets you **read** (`access` rules).
- **Permissions** → the access token's `permissions` claim → what the APIs (and `rapidoc mock`) let you **execute**.

Nothing here goes into `rapidoc.config.yaml` except the issuer (already there). The client ID and secret are environment variables when you run `rapidoc serve`.

---

## 1. Email delivery through Resend (once)

Auth0's built-in email service is for testing and has low limits. Verification and password-reset mail for the `@rapidocui.com` users should arrive reliably.

- [ ] **Branding → Email Provider → Use my own email provider → SMTP.**
  - Host `smtp.resend.com`, port `465` (or `587`), username `resend`, password: a Resend API key with sending access.
  - From: e.g. `Rapid Parcels Demo <auth@rapidocui.com>`.
- [ ] Send a test email from that page and check it arrives in Resend's **Inboxes**.

## 2. The API (permissions live here)

- [ ] **Applications → APIs → Create API.**
  - Name: `Rapid Parcels API`
  - Identifier: `https://api.rapidocui.com` (a name only; Auth0 never calls it, and it can't be changed later)
  - Signing algorithm: `RS256`
- [ ] **Settings → RBAC Settings:** turn on **Enable RBAC** and **Add Permissions in the Access Token**. Save.
- [ ] **Permissions tab:** add these nine (description in brackets):

  | Permission | Description |
  | :--- | :--- |
  | `shipments:read` | Read shipments |
  | `shipments:write` | Create and cancel shipments |
  | `tracking:read` | Read tracking events |
  | `carriers:read` | Read carrier manifests and pickups |
  | `carriers:write` | Upload labels, book pickups |
  | `billing:read` | Read invoices |
  | `billing:write` | Issue refunds and credit notes |
  | `admin:read` | Read users, keys and audit logs |
  | `admin:write` | Manage users and keys |

  The Rates API is public and needs no permission.

## 3. Default audience (so tokens are issued for that API)

RapiDoc's Try-it can't send Auth0's `audience` parameter, so Auth0 must assume it.

- [ ] **Settings (tenant) → General → API Authorization Settings → Default Audience:** `https://api.rapidocui.com`. Save.

## 4. The portal application

Use the existing **Default App** or create a dedicated one (clearer): **Applications → Create Application → `Rapid Parcels Portal` → Regular Web Applications.**

- [ ] **Settings:**
  - Allowed Callback URLs: `http://localhost:8090/_rapidoc/auth/callback`
  - Allowed Logout URLs: `http://localhost:8090/`
  - (When the demo is hosted, add the same paths on `https://demo.rapidocui.com`.)
- [ ] **Settings → Advanced → Grant Types:** `Authorization Code` is on.
- [ ] Copy the **Client ID** and **Client Secret** for `rapidoc serve` (step 9). Never paste the secret into a file in the repo.

## 5. Roles (and their permissions)

**User Management → Roles → Create Role**, then open the role → **Permissions → Add Permissions → Rapid Parcels API**:

| Role | Description | Permissions |
| :--- | :--- | :--- |
| `shipper` | Shop developer | `shipments:read`, `shipments:write` |
| `tracker` | Tracking integrator | `tracking:read` |
| `reviewer` | Technical reviewer: reads docs, can't call APIs | *none* |
| `carrier-partner` | Partner carrier engineer | `carriers:read`, `carriers:write` |
| `finance` | Finance analyst | `billing:read`, `billing:write` |
| `platform-admin` | Platform admin | all nine |

- [ ] Create the six roles with their permissions.
- [ ] Delete the earlier test roles `shipments-team`, `tracking-team` and `api-admin` (decision S5), after removing them from users.

## 6. Users

**User Management → Users.** Connection: `Username-Password-Authentication`.

| User | Role |
| :--- | :--- |
| `ship@rapidocui.com` | `shipper` |
| `track@rapidocui.com` | `tracker` |
| `review@rapidocui.com` | `reviewer` |
| `partner@rapidocui.com` *(create)* | `carrier-partner` |
| `finance@rapidocui.com` *(create)* | `finance` |
| `manager@rapidocui.com` | `platform-admin` |

- [ ] Create `partner@` and `finance@`.
- [ ] For each user: **Roles → Assign Roles** as in the table (one role each).
- [ ] Verify each email: on the user's page, send the verification email and open it from Resend's Inboxes. (`emails:` access rules only match verified addresses; the scenario's rules use roles, but verified emails avoid surprises later.)

## 7. The Action that puts roles into the sign-in

Already created for the first test; check it.

- [ ] **Actions → Library → "Add roles"** (trigger Login / Post Login), deployed, with:

  ```js
  exports.onExecutePostLogin = async (event, api) => {
    api.idToken.setCustomClaim('https://rapidoc/roles', event.authorization?.roles || []);
  };
  ```

- [ ] **Actions → Triggers → post-login:** "Add roles" is in the flow, and the flow is applied.

Keep the claim name without dots: the portal's `claims.groups` reads dots as nesting.

## 8. Optional: a login domain on rapidocui.com

- [ ] **Branding → Custom Domains:** `login.rapidocui.com`, Auth0-managed certificate, CNAME at your DNS. Then the issuer becomes `https://login.rapidocui.com/` (update `auth.issuer` in `rapidoc.config.yaml`). Skip for now if it needs a paid plan.

## 9. Run the portal

From `astro-rapidoc` (the demo's `rapidoc.config.yaml` already has `auth.issuer` and the access rules):

```bash
node packages/rapidoc-cli/src/index.js build ../demo-api-portal
```

```bash
RAPIDOC_AUTH_CLIENT_ID=<Client ID> RAPIDOC_AUTH_CLIENT_SECRET=<Client Secret> RAPIDOC_SESSION_SECRET=$(openssl rand -hex 32) RAPIDOC_PUBLIC_URL=http://localhost:8090 node packages/rapidoc-cli/src/index.js serve ../demo-api-portal/dist --port 8090
```

## 10. Check it

- [ ] Sign in as each user and compare with the "read" matrix (scenario section 5).
- [ ] The `rapidoc serve` terminal shows `signed in: …` and no `no "https://rapidoc/roles" claim` hint.
- [ ] Executing APIs (scenario section 6) needs the mock server (`rapidoc mock`, in progress) and a token in Try-it (step 5 of the plan).

If you want to look inside a token, decode it locally (e.g. `node -e "console.log(JSON.parse(Buffer.from(process.argv[1].split('.')[1], 'base64url')))" <token>`) rather than pasting it into a website.
