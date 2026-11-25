import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const docsDirectory = path.join(root, "docs");
const siteDirectory = path.join(root, "site");
const pages = [
  { source: null, route: "index.html", title: "Home", section: "Home", nav: false },
  { source: "README.md", route: "index.html", title: "Documentation", section: "Overview" },
  { source: "getting-started.md", route: "getting-started.html", title: "Getting started", section: "Learn" },
  { source: "cli-reference.md", route: "cli-reference.html", title: "CLI reference", section: "Learn" },
  { source: "supported-stacks.md", route: "supported-stacks.html", title: "Supported stacks", section: "Build" },
  { source: "resource-generation.md", route: "resource-generation.html", title: "Resource generation", section: "Build" },
  { source: "ai-agents.md", route: "ai-agents.html", title: "AI & automation", section: "Build" },
  { source: "ci-and-publishing.md", route: "ci-and-publishing.html", title: "CI & publishing", section: "Ship" },
  { source: "../AGENTS.md", route: "agents.html", title: "Contributor guide", section: "Ship" },
];

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const readSource = (source) => fs.readFileSync(path.resolve(docsDirectory, source), "utf8");

const getDescription = (markdown) => {
  const paragraph = markdown
    .split(/\r?\n/)
    .find((line) => line.trim() && !line.startsWith("#") && !line.startsWith(">"));
  return paragraph?.replace(/[*`]/g, "").slice(0, 155) ?? "Documentation for men-pack, the Node.js backend scaffolding CLI.";
};

const rewriteLinks = (html) =>
  html
    .replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"')
    .replaceAll('href="../AGENTS.html"', 'href="./agents.html"')
    .replace(/<a href="https?:\/\/([^"]+)">/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer">');

const renderMarkdown = (markdown) =>
  rewriteLinks(marked.parse(markdown, { gfm: true, breaks: false }));

const toSearchText = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const navMarkup = (currentRoute, assetPrefix) => {
  const sections = ["Overview", "Learn", "Build", "Ship"];
  return sections
    .map((section) => {
      const links = pages
        .filter((page) => page.section === section && page.nav !== false)
        .map((page) => {
          const href = `${assetPrefix}docs/${page.route}`;
          const active = page === currentRoute ? ' aria-current="page"' : "";
          return `<a class="nav-link${active ? " is-active" : ""}" href="${href}"${active}><span>${escapeHtml(page.title)}</span></a>`;
        })
        .join("\n");
      return `<div class="nav-group"><p class="nav-label">${section}</p>${links}</div>`;
    })
    .join("\n");
};

const renderPage = ({ page, description, content, assetPrefix }) => {
  const canonicalPath = page.source === null ? "" : `docs/${page.route}`;
  const canonical = `https://dhiraj2105.github.io/men-pack/${canonicalPath}`;
  const template = fs.readFileSync(path.join(docsDirectory, "site", "page.html"), "utf8");
  return template
    .replaceAll("{{TITLE}}", escapeHtml(page.title))
    .replaceAll("{{DESCRIPTION}}", escapeHtml(description))
    .replaceAll("{{VERSION}}", escapeHtml(packageVersion))
    .replaceAll("{{CANONICAL}}", canonical)
    .replaceAll("{{ASSET_PREFIX}}", assetPrefix)
    .replaceAll("{{NAV}}", navMarkup(page, assetPrefix))
    .replaceAll("{{CONTENT}}", content);
};

fs.rmSync(siteDirectory, { recursive: true, force: true });
fs.mkdirSync(path.join(siteDirectory, "docs", "schemas"), { recursive: true });
fs.mkdirSync(path.join(siteDirectory, "assets"), { recursive: true });

for (const page of pages) {
  const isHome = page.source === null;
  const markdown = isHome ? "" : readSource(page.source);
  const content = isHome
    ? fs.readFileSync(path.join(docsDirectory, "site", "home.html"), "utf8")
    : renderMarkdown(markdown);
  const description = isHome
    ? "Scaffold polished Node.js APIs with Express, Fastify or NestJS. Choose your database, generate resources, and get straight to building."
    : getDescription(markdown);
  const output = isHome
    ? path.join(siteDirectory, page.route)
    : path.join(siteDirectory, "docs", page.route);
  fs.writeFileSync(
    output,
    renderPage({
      page,
      description,
      content,
      assetPrefix: isHome ? "" : "../",
    }),
  );
}

const searchIndex = pages.filter((page) => page.source !== null).map((page) => {
  const markdown = readSource(page.source);
  return {
    title: page.title,
    url: `docs/${page.route}`,
    excerpt: getDescription(markdown),
    text: toSearchText(markdown),
  };
});
fs.writeFileSync(
  path.join(siteDirectory, "search-index.json"),
  `${JSON.stringify(searchIndex)}\n`,
);
fs.copyFileSync(
  path.join(docsDirectory, "schemas", "cli-result.schema.json"),
  path.join(siteDirectory, "docs", "schemas", "cli-result.schema.json"),
);
const llms = fs
  .readFileSync(path.join(root, "llms.txt"), "utf8")
  .replaceAll("(docs/README.md)", "(docs/index.html)")
  .replace(/\(docs\/([^)]*)\.md\)/g, "(docs/$1.html)");
fs.writeFileSync(path.join(siteDirectory, "llms.txt"), llms);
fs.writeFileSync(
  path.join(siteDirectory, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://dhiraj2105.github.io/men-pack/sitemap.xml\n",
);
fs.writeFileSync(
  path.join(siteDirectory, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((page) => {
      const location =
        page.source === null ? "" : `docs/${page.route}`;
      return `  <url><loc>https://dhiraj2105.github.io/men-pack/${location}</loc></url>`;
    })
    .join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(
  path.join(siteDirectory, "assets", "favicon.svg"),
  fs.readFileSync(path.join(docsDirectory, "site", "favicon.svg")),
);
fs.writeFileSync(
  path.join(siteDirectory, "assets", "site.css"),
  fs.readFileSync(path.join(docsDirectory, "site", "site.css")),
);
fs.writeFileSync(
  path.join(siteDirectory, "assets", "site.js"),
  fs.readFileSync(path.join(docsDirectory, "site", "site.js")),
);

console.log(`Built ${pages.length} documentation pages in ${path.relative(root, siteDirectory)}/`);
