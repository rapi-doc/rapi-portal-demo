# 🚀 Cosmo Cargo Demo API Portal

This repository serves as the reference testbed and dog-fooding environment for **RapiDoc**, **`@rapidoc/cli`**, and **`@rapidoc/portal`**.

It demonstrates a full-featured developer portal for **Cosmo Cargo Inc.**, a fictional interstellar shipping company: an API catalog, interactive API references, and narrative documentation, all generated from `rapidoc.config.yaml`.

---

## Repository Structure

```text
demo-api-portal/
├── rapidoc.config.yaml             # Portal config (v2): site, theme, header, navigation tabs, apis, footer, rapidoc
├── specs/                          # OpenAPI specifications
│   ├── shipments.json              # Shipment API (has its own header tab)
│   ├── label-v3.json               # Labels & Stamps API (label-base, label-v1, label-v2 are earlier versions)
│   ├── webhooks.json               # Webhook API
│   ├── interplanetary.json         # Interplanetary Shipping API
│   ├── tracking-v1.json            # Shipping Tracking API
│   ├── ai-cargo.json               # AI-Powered Cargo Management API
│   ├── docs.json                   # Cosmo Cargo Documentation API
│   ├── cargo-containers.json       # Cargo Container Specifications API
│   └── fleet-ops.json              # Fleet Operations API
├── public/logo.svg                 # Header and footer logo (site.logo.src)
├── docs/                           # Narrative documentation (Markdown, MDX, Markdoc)
│   ├── index.markdoc               # Home page (/): Starlight splash template, cards, a live embed
│   ├── documentation.mdx           # Docs landing page
│   ├── guides/first-shipment.markdoc # Markdoc guide with live Shipment API embeds ({% api-operation %})
│   ├── shipping-process.mdx, tracking.mdx, warp-lane-tutorial.mdx, ...
│   ├── billing/                    # Galactic credits, invoices, refunds
│   ├── cargo-handbook/             # Anomalous, cryo, hazardous, and living cargo
│   ├── compliance/                 # Customs, quarantine, treaties
│   ├── fleet/                      # Crew, maintenance, refueling, warp drives
│   └── support/                    # Contact, escalations, FAQ
└── package.json                    # npm scripts that run the monorepo's rapidoc CLI
```

### Test fixtures

Some files are kept as fixtures for the `@rapidoc/portal` and `@rapidoc/cli` test suites in the RapiDoc monorepo. They are not part of the Cosmo Cargo navigation, but **do not delete or rename them**:

- `specs/orders-api.yaml`, `catalog-api.yaml`, `loyalty-api.yaml`, `payments-api.yaml`, `reservations-api.yaml`
- `docs/guides/order-fulfillment.markdoc`, `docs/guides/loyalty-and-rewards.markdoc` (Markdoc tag coverage; their `api-operation` embeds name APIs that are not in `apis:`, which exercises the "API operation not found" notice)
- `docs/tutorials/table-reservation-flow.mdx`, `docs/tutorials/webhook-integration.mdx`

---

## Local Development

This project is for local testing only and is not published. It is built with the `rapidoc` CLI from the RapiDoc monorepo (`astro-rapidoc`), expected as a sibling checkout at `../astro-rapidoc`, so it always uses that checkout's current branch. Once `@rapidoc/cli` and `@rapidoc/portal` are published, it will depend on them like any other portal.

```bash
npm run dev        # live dev server with hot reload on http://localhost:4321
npm run build      # static build into dist/
npm run preview    # serve dist/ on http://localhost:8000
npm run validate   # validate every spec in apis: (one spec: npm run validate -- ./specs/shipments.json)
```

From the monorepo, `npm run build:demo` rebuilds the RapiDoc bundle first and then builds this project.

`dist/` is the build output. While `dev` or `build` runs, the engine keeps its temporary Astro project in `.rapidoc-temp/` and deletes it when it finishes; both are gitignored.

### Sign-in and access rules (optional)

The end of `rapidoc.config.yaml` has a commented-out `auth` and `access` example. With them, `npm run build` splits `dist/` into `public/` and `protected/`, and the portal is served with `npx rapidoc serve dist` (install `@rapidoc/server`; set `RAPIDOC_SESSION_SECRET`, `RAPIDOC_AUTH_CLIENT_SECRET` and `RAPIDOC_PUBLIC_URL`). A static host such as GitHub Pages can't check who is signed in, so a portal with rules needs `rapidoc serve`. See "Sign-in and access rules" in the `@rapidoc/portal` README.

### Keeping in sync with `@rapidoc/portal`

This repo tracks the current portal code. When the portal's config structure, Markdoc tags, or CLI commands change, update `rapidoc.config.yaml` and `docs/` here to match, then run `npm run test:portal` in the monorepo (those tests load and build this repo).

---

## Hosting on GitHub Pages

1. In your repository settings, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Pushes to `main`/`master` run `.github/workflows/deploy.yml`, which uploads the repository root to GitHub Pages.
