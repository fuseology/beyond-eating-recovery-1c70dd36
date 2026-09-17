// Build-time prerendering: renders every route in src/App.tsx to static HTML
// so crawlers that do not execute JavaScript see the real title, meta and JSON-LD.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

const ssrDir = path.join(root, "dist-ssr");
const findEntry = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findEntry(full);
      if (found) return found;
    } else if (/^entry-server(\.[\w-]+)?\.(m?js)$/.test(entry.name)) {
      return full;
    }
  }
  return null;
};
const entryPath = findEntry(ssrDir);
if (!entryPath) throw new Error("SSR entry-server bundle not found in dist-ssr");

const { render, routes } = await import(pathToFileURL(entryPath).href);

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

const hasTag = (head, re) => re.test(head);

let count = 0;
for (const route of routes) {
  let html, head;
  try {
    ({ html, head } = render(route.path));
  } catch (err) {
    console.warn(`⚠ Skipped ${route.path}: ${err.message}`);
    continue;
  }

  let page = template;

  // Avoid duplicate head tags: page-level Helmet output wins over the shell defaults.
  if (hasTag(head, /<title[\s>]/i)) {
    page = page.replace(/\s*<title>[\s\S]*?<\/title>/i, "");
  }
  if (hasTag(head, /<meta[^>]+name="description"/i)) {
    page = page.replace(/\s*<meta\s+name="description"[^>]*>/i, "");
  }
  if (hasTag(head, /<link[^>]+rel="canonical"/i)) {
    page = page.replace(/\s*<link\s+rel="canonical"[^>]*>/i, "");
  }

  page = page.replace("</head>", `  ${head}\n  </head>`);
  page = page.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${html}</div>`
  );

  const outPath =
    route.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.path, "index.html");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page, "utf-8");
  count++;
}

console.log(`✓ Prerendered ${count} routes to static HTML`);
