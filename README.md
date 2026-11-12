# RapiDoc Portal examples

Example developer portals built with [RapiDoc Portal](https://github.com/rapi-doc/rapi-portal-doc): `@rapidoc/cli`, `@rapidoc/portal`, `@rapidoc/server` and `@rapidoc/mock`. Each folder is a complete portal project; clone the repository, pick one, and run it.

**See them live:** [demo.rapidocui.com](https://demo.rapidocui.com/) lists every example. Bookstore and Cosmo Cargo are static sites on GitHub Pages; Rapid Parcels needs `rapidoc serve` for sign-in, so it runs on a server at [parcels.rapidocui.com](https://parcels.rapidocui.com/), with its mock API at `mock.rapidocui.com`. Hosting sponsored by [Simafri](https://www.simafri.com/en/managed-vps/) (managed VPS).

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

## Hosting

| What | Where | How |
| :--- | :--- | :--- |
| Landing page (`site/`), `bookstore/`, `cosmo-cargo/` | GitHub Pages at `demo.rapidocui.com` (`site/CNAME`), each portal in its own folder | `.github/workflows/pages.yml` runs `deploy/build-pages.mjs` on every push to `main` |
| `rapid-parcels/` (sign-in) and its mock API | A managed VPS at `parcels.rapidocui.com` and `mock.rapidocui.com` | `.github/workflows/deploy-server.yml` has the server build and restart on every push to `main`; setup in `deploy/server/README.md` |

Both build with the **published** packages pinned in `deploy/package-lock.json`, not the monorepo checkout, so the hosted examples show what users get from npm. To try a newer release, bump the versions in `deploy/package.json` and run `npm install --prefix deploy`.

`deploy/build-pages.mjs` sets each portal's `site.url` to `<Pages URL>/<folder>` for that build only (the path of `site.url` is the portal's base path), so the committed configs and `npm run dev` keep serving at the root. Build the Pages site locally with:

```bash
npm ci --prefix deploy
node deploy/build-pages.mjs     # into _site/
```

## Layout

```text
bookstore/        rapidoc.config.yaml, docs/, specs/bookstore.yaml
rapid-parcels/    rapidoc.config.yaml, docs/, specs/, public/, styles/, auth0-setup.md
cosmo-cargo/      rapidoc.config.yaml, docs/, specs/, public/ (© Zuplo, MIT: LICENSE-ZUDOKU.md)
site/             the landing page published at the root of GitHub Pages
deploy/           pinned @rapidoc packages and build-pages.mjs, used by the Pages workflow and the server
deploy/server/    what the server runs on a deploy, and how it is set up
```
