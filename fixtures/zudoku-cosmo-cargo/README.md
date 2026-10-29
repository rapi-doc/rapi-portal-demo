# Cosmo Cargo (Zudoku comparison fixture)

A complete RapiDoc portal project built on **Cosmo Cargo**, the fictional interstellar shipping company of the [Zudoku](https://zudoku.dev) demo. It has two jobs:

1. **Test fixture** for the RapiDoc monorepo: `@rapidoc/portal` and `@rapidoc/cli` tests load and build this folder (`RAPIDOC_DEMO_PORTAL_DIR` overrides its location).
2. **Side-by-side comparison** with Zudoku: the same specs and docs built by both products.

The main demo of this repository is **Rapid Parcels** (one folder up), with specs written for RapiDoc's own test cases.

## Origin and license

The OpenAPI specs and most docs come from Zudoku's Cosmo Cargo example, © Zuplo, Inc., used under the MIT License: see [`LICENSE-ZUDOKU.md`](LICENSE-ZUDOKU.md). RapiDoc added `rapidoc.config.yaml`, `public/logo.svg`, the Markdoc guides (`docs/index.markdoc`, `docs/guides/*.markdoc`) and the extra test specs listed below, and fixed some specs to declare OpenAPI 3.1 where they use 3.1 features.

## Keep these files

The monorepo tests depend on them. **Don't delete or rename** anything here without updating those tests; in particular:

- `specs/orders-api.yaml`, `catalog-api.yaml`, `loyalty-api.yaml`, `payments-api.yaml`, `reservations-api.yaml`
- `docs/guides/order-fulfillment.markdoc`, `docs/guides/loyalty-and-rewards.markdoc` (Markdoc tag coverage; their `api-operation` embeds name APIs that are not in `apis:`, which exercises the "API operation not found" notice)
- `docs/tutorials/table-reservation-flow.mdx`, `docs/tutorials/webhook-integration.mdx`
- `specs/label-v3.json` with `label-base.json` (a spec with relative `$ref`s to another file)
- `specs/label-v2.json`, `label-v1.json`: with `label-v3.json`, the versions of the `labels` API (`versions:` in `rapidoc.config.yaml`; v3 at `/apis/labels`, the others at `/apis/labels/v2` and `/apis/labels/v1`)

## Build it with RapiDoc

From the monorepo (`rapidoc`):

```bash
node packages/rapidoc-cli/src/index.js build ../rapi-portal-demo/fixtures/zudoku-cosmo-cargo
```

The `rapidoc.config.yaml` ends with a commented-out `auth`/`access` example; the fixture itself stays a plain static site, because the tests expect that layout.
