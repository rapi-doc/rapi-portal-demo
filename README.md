# 🚀 Cosmo Cargo Demo API Portal

This repository serves as the reference testbed and dog-fooding environment for **RapiDoc**, **`@rapidoc/cli`**, and **`@rapidoc/portal`**.

It demonstrates a full-featured developer portal for **Cosmo Cargo Inc.**, a fictional interstellar shipping company: an API catalog, interactive API references, and narrative documentation, all generated from `rapidoc.config.yaml`.

---

## Repository Structure

```text
demo-api-portal/
├── rapidoc.config.yaml             # Portal config: site, docs, apis, navigation, rapidoc, theme
├── specs/                          # OpenAPI specifications
│   ├── shipments.json              # Shipment API (featured)
│   ├── label-v3.json               # Labels & Stamps API (label-base, label-v1, label-v2 are earlier versions)
│   ├── webhooks.json               # Webhook API
│   ├── interplanetary.json         # Interplanetary Shipping API
│   ├── tracking-v1.json            # Shipping Tracking API
│   ├── ai-cargo.json               # AI-Powered Cargo Management API
│   ├── docs.json                   # Cosmo Cargo Documentation API
│   ├── cargo-containers.json       # Cargo Container Specifications API
│   └── fleet-ops.json              # Fleet Operations API
├── docs/                           # Narrative documentation (Markdown, MDX, Markdoc)
│   ├── documentation.mdx           # Docs landing page
│   ├── guides/first-shipment.markdoc # Markdoc guide with live Shipment API embeds ({% api-operation %})
│   ├── shipping-process.mdx, tracking.mdx, warp-lane-tutorial.mdx, ...
│   ├── billing/                    # Galactic credits, invoices, refunds
│   ├── cargo-handbook/             # Anomalous, cryo, hazardous, and living cargo
│   ├── compliance/                 # Customs, quarantine, treaties
│   ├── fleet/                      # Crew, maintenance, refueling, warp drives
│   └── support/                    # Contact, escalations, FAQ
├── index.html                      # Legacy standalone RapiDoc test shell
├── package.json
└── .github/workflows/deploy.yml    # GitHub Pages deployment
```

### Test fixtures

Some files are kept as fixtures for the `@rapidoc/portal` and `@rapidoc/cli` test suites in the RapiDoc monorepo. They are not part of the Cosmo Cargo navigation, but **do not delete or rename them**:

- `specs/orders-api.yaml`, `catalog-api.yaml`, `loyalty-api.yaml`, `payments-api.yaml`, `reservations-api.yaml`
- `docs/guides/order-fulfillment.markdoc`, `docs/guides/loyalty-and-rewards.markdoc` (Markdoc tag coverage; their `api-operation` embeds name APIs that are not in `apis:`, which exercises the "API operation not found" notice)
- `docs/tutorials/table-reservation-flow.mdx`, `docs/tutorials/webhook-integration.mdx`

---

## Local Development

The portal is built with the `rapidoc` CLI from the RapiDoc monorepo (`astro-rapidoc`), expected as a sibling checkout at `../astro-rapidoc`.

```bash
# Live dev server with hot reload on http://localhost:4321
node ../astro-rapidoc/packages/rapidoc-cli/src/index.js dev

# Static build into dist/
node ../astro-rapidoc/packages/rapidoc-cli/src/index.js build

# Validate a spec
node ../astro-rapidoc/packages/rapidoc-cli/src/index.js validate ./specs/shipments.json
```

`dist/` is the build output. While `dev` or `build` runs, the engine keeps its temporary Astro project in `.rapidoc-temp/` and deletes it when it finishes; both are gitignored.

### Keeping in sync with `@rapidoc/portal`

This repo tracks the current portal code. When the portal's config structure, Markdoc tags, or CLI commands change, update `rapidoc.config.yaml` and `docs/` here to match, then run `npm run test:portal` in the monorepo (those tests load and build this repo).

---

## Hosting on GitHub Pages

1. In your repository settings, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Pushes to `main`/`master` run `.github/workflows/deploy.yml`, which uploads the repository root to GitHub Pages.
