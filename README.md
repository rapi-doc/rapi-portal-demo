# ☕ BrewCraft Demo API Portal

This repository serves as the reference testbed and dog-fooding environment for **RapiDoc**, **`@rapidoc/cli`**, and **`@rapidoc/portal`**.

It demonstrates a full-featured developer platform for a modern coffee shop and reservation platform ("BrewCraft").

---

## Repository Structure

```text
demo-api-portal/
├── specs/                          # 5 OpenAPI Specifications
│   ├── orders-api.yaml             # 1. Orders & fulfillment
│   ├── catalog-api.yaml            # 2. Coffee blends, menu & bakery inventory
│   ├── reservations-api.yaml       # 3. Table reservations & seating areas
│   ├── loyalty-api.yaml            # 4. BeanPoints, member profiles & rewards
│   └── payments-api.yaml           # 5. Charges, tips & refunds
├── docs/                           # Documentation Files (3 formats)
│   ├── getting-started.md          # Markdown: Overview & Base URLs
│   ├── authentication.md           # Markdown: Tokens & API Keys
│   ├── errors-and-status-codes.md  # Markdown: RFC 7807 problem details
│   ├── guides/
│   │   ├── order-fulfillment.markdoc     # Markdoc: Steps, tabs & api-operation
│   │   └── loyalty-and-rewards.markdoc   # Markdoc: Cards & redemption
│   └── tutorials/
│       ├── table-reservation-flow.mdx    # MDX: Components & table slots
│       └── webhook-integration.mdx       # MDX: Webhook signatures
├── rapidoc.config.yaml             # Tolerant Super-Set config
├── index.html                      # Standalone static portal test shell
├── package.json                    # Scripts
└── .github/workflows/deploy.yml    # GitHub Pages automated deployment
```

---

## Local Development & Testing

You can instantly test and serve this repository locally using Python:

```bash
# Run local HTTP server
python3 -m http.server 8000

# or using npm
npm run serve
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Hosting on GitHub Pages

This repository is ready to deploy directly to GitHub Pages:
1. Push this repository to GitHub.
2. In your repository settings, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will build and publish your portal automatically.
