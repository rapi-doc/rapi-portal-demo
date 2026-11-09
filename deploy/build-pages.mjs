// Builds the GitHub Pages site into ../_site: the landing page (../site/) at the root and each
// static example in its own folder, served under <PAGES_URL>/<folder>/. Rapid Parcels needs
// `rapidoc serve` for sign-in, so it runs on Render (../render.yaml) and the landing page links there.
//
//   npm ci --prefix deploy && node deploy/build-pages.mjs
//
// PAGES_URL is where the site is published (the workflow passes GitHub's base_url).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const PORTALS = ["bookstore", "cosmo-cargo"];

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "_site");
const rapidoc = path.join(here, "node_modules", ".bin", "rapidoc");
const pagesUrl = (process.env.PAGES_URL || "https://demo.rapidocui.com").replace(
  /\/+$/,
  "",
);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "site"), out, { recursive: true });
fs.writeFileSync(path.join(out, ".nojekyll"), "");

for (const name of PORTALS) {
  const dir = path.join(root, name);
  const configFile = path.join(dir, "rapidoc.config.yaml");
  const original = fs.readFileSync(configFile, "utf8");

  // The portal's base path is the path of site.url. Set it for this build only, so the committed
  // config (and `npm run dev`) keeps serving at the root.
  const doc = parseDocument(original);
  doc.setIn(["site", "url"], `${pagesUrl}/${name}`);
  fs.writeFileSync(configFile, doc.toString());
  try {
    console.log(`\n▶ ${name} → ${pagesUrl}/${name}/`);
    execFileSync(rapidoc, ["build", dir, "--out-dir", path.join(out, name)], { stdio: "inherit" });
  } finally {
    fs.writeFileSync(configFile, original);
  }
}

console.log(`\n✔ GitHub Pages site in ${path.relative(process.cwd(), out) || "."}`);
