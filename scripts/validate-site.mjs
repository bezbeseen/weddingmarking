import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { futureVerticals, verticals } from "../src/data/verticals/index.js";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredRoutes = ["index.html", "construction/index.html", "event-planners/index.html", "weddings/index.html"];
const missing = [];
const contentIssues = [];

for (const route of requiredRoutes) {
  const routePath = join(projectRoot, route);
  if (!existsSync(routePath)) {
    missing.push(route);
  }
}

function collectImages(value, images = []) {
  if (!value || typeof value !== "object") return images;

  if (typeof value.src === "string" && value.src.startsWith("/assets/")) {
    images.push(value.src);
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      child.forEach((entry) => collectImages(entry, images));
    } else {
      collectImages(child, images);
    }
  }

  return images;
}

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    contentIssues.push(label);
  }
}

function requireArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    contentIssues.push(label);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routeHeadMatches(routePath, vertical) {
  const html = readFileSync(routePath, "utf8");
  const expectedTitle = `<title>${escapeHtml(vertical.meta.title)}</title>`;
  const expectedDescription = `content="${escapeHtml(vertical.meta.description)}"`;

  if (!html.includes(expectedTitle)) {
    contentIssues.push(`${vertical.key} route title is not synced from verticals.js`);
  }

  if (!html.includes(expectedDescription)) {
    contentIssues.push(`${vertical.key} route description is not synced from verticals.js`);
  }
}

for (const vertical of Object.values(verticals)) {
  const routePath = join(projectRoot, vertical.path.replace(/^\//, ""), "index.html");
  if (!existsSync(routePath)) {
    missing.push(`${vertical.path} route file`);
  } else {
    routeHeadMatches(routePath, vertical);
  }

  requireText(vertical.name, `${vertical.key}.name`);
  requireText(vertical.path, `${vertical.key}.path`);
  requireText(vertical.meta?.title, `${vertical.key}.meta.title`);
  requireText(vertical.meta?.description, `${vertical.key}.meta.description`);
  requireText(vertical.hero?.title, `${vertical.key}.hero.title`);
  requireText(vertical.hero?.copy, `${vertical.key}.hero.copy`);
  requireText(vertical.hero?.primaryCta, `${vertical.key}.hero.primaryCta`);
  if (!String(vertical.template || "").includes("flagship")) {
    requireText(vertical.hero?.secondaryCta, `${vertical.key}.hero.secondaryCta`);
  }
  requireText(vertical.cta?.title, `${vertical.key}.cta.title`);
  requireText(vertical.cta?.copy, `${vertical.key}.cta.copy`);
  requireText(vertical.form?.title, `${vertical.key}.form.title`);
  requireText(vertical.form?.buttonLabel, `${vertical.key}.form.buttonLabel`);
  requireArray(vertical.services?.cards, `${vertical.key}.services.cards`);
  requireArray(vertical.showcase?.items, `${vertical.key}.showcase.items`);
  requireArray(vertical.testimonials?.items, `${vertical.key}.testimonials.items`);
  requireArray(vertical.process?.steps, `${vertical.key}.process.steps`);
  requireArray(vertical.cta?.items, `${vertical.key}.cta.items`);

  for (const imagePath of collectImages(vertical)) {
    const localPath = join(projectRoot, imagePath.replace(/^\//, ""));
    if (!existsSync(localPath)) {
      missing.push(imagePath);
    }
  }
}

for (const futureVertical of futureVerticals) {
  if (!futureVertical.name || !futureVertical.slug || !futureVertical.assetFolder) {
    missing.push(`future vertical metadata for ${futureVertical.name || "unknown vertical"}`);
  }
}

if (missing.length) {
  console.error("Missing required site files:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

if (contentIssues.length) {
  console.error("Content structure needs attention:");
  for (const item of contentIssues) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Site validation passed: routes, image paths, SEO metadata, and owner-editable content fields are present.");
