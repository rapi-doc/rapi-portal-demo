# Bookstore Developer Portal

Welcome to your developer portal, powered by **[@rapidoc/portal](https://rapidocweb.com)**.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Live preview with hot reload
npm run dev

# 3. Build the static portal (SSG) into dist/, then preview it
npm run build
npm run preview
```

Run `npm run validate` (for example in CI) to check every spec in `apis:` against the OpenAPI schema. It also warns about operations without an `operationId`, whose links change when their summary is edited.

## Project Structure

```text
├── docs/                 # Documentation pages (.md, .markdoc, .mdx); docs/index.* is the home page
├── specs/                # OpenAPI specifications (.yaml, .json)
├── public/               # Static files (logo, favicon, images), served from /
├── rapidoc.config.yaml   # Portal header, navigation tabs, theme and APIs
├── package.json
└── README.md
```
