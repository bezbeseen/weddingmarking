import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { verticals } from "../src/data/verticals/index.js";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function syncRouteHead(vertical) {
  const routeFile = join(projectRoot, vertical.path.replace(/^\//, ""), "index.html");
  let html = readFileSync(routeFile, "utf8");

  html = html.replace(
    /<title>.*?<\/title>/s,
    `<title>${escapeHtml(vertical.meta.title)}</title>`,
  );

  html = html.replace(
    /<meta name="description" content=".*?">/s,
    `<meta name="description" content="${escapeHtml(vertical.meta.description)}">`,
  );

  writeFileSync(routeFile, html);
}

for (const vertical of Object.values(verticals)) {
  syncRouteHead(vertical);
}

console.log("Route SEO titles and descriptions are synced from src/data/verticals/.");
