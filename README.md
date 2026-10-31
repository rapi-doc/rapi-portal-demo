# RapiDoc Portal examples

Example developer portals built with [RapiDoc Portal](https://github.com/rapi-doc/rapi-portal-doc): `@rapidoc/cli`, `@rapidoc/portal`, `@rapidoc/server` and `@rapidoc/mock`. Each folder is a complete portal project; clone the repository, pick one, and run it.

| Example | What it shows |
| :--- | :--- |
| [`bookstore/`](bookstore/) | The smallest portal: one OpenAPI spec, a few guides, and the mock server behind **Try**. What `npm create rapidoc` scaffolds. |
| [`rapid-parcels/`](rapid-parcels/) | A fictional parcel network with six APIs: sign-in with Auth0, public and protected pages and APIs, read-versus-execute permissions, API versions, webhooks and callbacks, a 144-operation admin API, and a theme of its own. |
| [`cosmo-cargo/`](cosmo-cargo/) | [Zudoku](https://zudoku.dev)'s Cosmo Cargo demo built with RapiDoc Portal: a migration from Zudoku, and the fixture the RapiDoc monorepo's tests build. |

## Running an example

Until the packages are on npm, the examples run the CLI from a checkout of the [RapiDoc monorepo](https://github.com/rapi-doc/RapiDoc) next to this repository (`../rapidoc`), with its `rapidoc` package built (`npm run build:rapidoc` there):

```bash
cd bookstore
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run validate   # checks the specs
```

Rapid Parcels also has `npm run serve` (sign-in, needs a `.env`; see its README) and `npm run mock`.

## Layout

```text
bookstore/        rapidoc.config.yaml, docs/, specs/bookstore.yaml
rapid-parcels/    rapidoc.config.yaml, docs/, specs/, public/, styles/, auth0-setup.md
cosmo-cargo/      rapidoc.config.yaml, docs/, specs/, public/ (© Zuplo, MIT: LICENSE-ZUDOKU.md)
```
