import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");

test("builds a complete responsive documentation website with working local links", () => {
  const expectedPages = [
    "index.html",
    "docs/index.html",
    "docs/getting-started.html",
    "docs/cli-reference.html",
    "docs/supported-stacks.html",
    "docs/resource-generation.html",
    "docs/ai-agents.html",
    "docs/ci-and-publishing.html",
    "docs/agents.html",
  ];

  for (const relativePath of expectedPages) {
    const file = path.join(site, relativePath);
    assert.ok(fs.existsSync(file), `missing page ${relativePath}`);
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /<html lang="en"/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /rel="canonical"/);

    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|#|data:)/.test(href)) continue;
      const localPath = href.split("#")[0].split("?")[0];
      if (!localPath) continue;
      const target = path.resolve(path.dirname(file), localPath);
      assert.ok(fs.existsSync(target), `${relativePath} has broken local URL ${href}`);
    }
  }

  const home = fs.readFileSync(path.join(site, "index.html"), "utf8");
  const packageVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
  assert.match(home, /name="viewport"/);
  assert.match(home, /application\/ld\+json/);
  assert.match(home, /https:\/\/www\.npmjs\.com\/package\/men-pack/);
  assert.match(home, /https:\/\/github\.com\/dhiraj2105\/men-pack/);
  assert.ok(home.includes(`> v${packageVersion}</span>`));

  const stylesheet = fs.readFileSync(path.join(site, "assets/site.css"), "utf8");
  assert.match(stylesheet, /max-width: 540px/);
  assert.match(stylesheet, /data-theme="dark"/);
  const script = fs.readFileSync(path.join(site, "assets/site.js"), "utf8");
  assert.match(script, /men-pack-theme/);
  assert.match(script, /search-index\.json/);

  const searchIndex = JSON.parse(fs.readFileSync(path.join(site, "search-index.json"), "utf8"));
  assert.ok(searchIndex.length >= 8);
  assert.ok(searchIndex.some((entry) => entry.title === "AI & automation"));
  assert.ok(fs.existsSync(path.join(site, "sitemap.xml")));
  assert.ok(fs.existsSync(path.join(site, "robots.txt")));
});
