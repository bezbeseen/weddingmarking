import { escapeHtml, imageMarkup, listItems } from "./utils.js";

function sectionLabel(section) {
  return section?.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : "";
}

function sectionHeader(section, className = "") {
  return `
    <div class="wedding-v2-section-head ${escapeHtml(className)}">
      ${sectionLabel(section)}
      <h2>${escapeHtml(section.title)}</h2>
      ${section.subtitle ? `<p class="wedding-v2-subtitle">${escapeHtml(section.subtitle)}</p>` : ""}
      ${section.copy ? `<p>${escapeHtml(section.copy)}</p>` : ""}
    </div>
  `;
}

function actionLink(action = {}, className = "button") {
  if (!action.label) return "";

  return `
    <a class="${escapeHtml(action.className || className)}" href="${escapeHtml(action.href || "#quote")}">
      ${escapeHtml(action.label)}
    </a>
  `;
}

function imageFigure(image, caption, className = "") {
  if (!image?.src) return "";

  return `
    <figure class="${escapeHtml(className)}">
      ${imageMarkup(image)}
      ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
    </figure>
  `;
}

function imageTiles(images = [], className = "") {
  if (!images.length) return "";

  return `
    <div class="${escapeHtml(className)}">
      ${images
        .map(
          (item) => `
            <figure>
              ${imageMarkup(item.image)}
              ${
                item.title || item.copy
                  ? `<figcaption>
                      ${item.title ? `<strong>${escapeHtml(item.title)}</strong>` : ""}
                      ${item.copy ? `<span>${escapeHtml(item.copy)}</span>` : ""}
                    </figcaption>`
                  : ""
              }
            </figure>
          `,
        )
        .join("")}
    </div>
  `;
}

export function WeddingV2Hero({ section }) {
  if (!section) return "";

  return `
    <section id="top" class="wedding-v2-hero">
      <div class="wedding-v2-hero-media">
        ${imageMarkup({ ...section.image, loading: "eager" })}
      </div>
      <div class="container wedding-v2-hero-content">
        <div class="wedding-v2-hero-copy">
          ${sectionLabel(section)}
          <h1>${escapeHtml(section.title)}</h1>
          <p>${escapeHtml(section.copy)}</p>
          <div class="button-row">
            ${actionLink(section.primaryAction)}
            ${actionLink({ ...section.secondaryAction, className: "button secondary" })}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function HeroTrustBar({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section class="wedding-v2-trust-bar" aria-label="${escapeHtml(section.label || "Wedding trust signals")}">
      <div class="container wedding-v2-trust-track">
        ${section.items
          .map(
            (item) => `
              <span>${escapeHtml(item)}</span>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function RealWedding({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "real-wedding")}" class="section wedding-v2-real-wedding">
      <div class="container">
        <div class="wedding-v2-story-layout">
          <div>
            ${sectionHeader(section)}
            ${section.body ? `<p class="wedding-v2-story-copy">${escapeHtml(section.body)}</p>` : ""}
            ${
              section.pieces?.length
                ? `<div class="wedding-v2-piece-list">${section.pieces
                    .map((piece) => `<span>${escapeHtml(piece)}</span>`)
                    .join("")}</div>`
                : ""
            }
          </div>
          ${imageFigure(section.image, section.imageCaption, "wedding-v2-story-image")}
        </div>
        ${
          section.featuredImages?.length
            ? imageTiles(section.featuredImages, "wedding-v2-featured-images")
            : ""
        }
        ${
          section.timeline?.length
            ? `<div class="wedding-v2-timeline" aria-label="${escapeHtml(section.timelineLabel || "Wedding timeline")}">
                ${section.timeline
                  .map(
                    (item) => `
                      <article class="wedding-v2-timeline-card">
                        ${imageMarkup(item.image)}
                        <div>
                          <h3>${escapeHtml(item.title)}</h3>
                          <p>${escapeHtml(item.copy)}</p>
                        </div>
                      </article>
                    `,
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${
          section.gallery?.items?.length
            ? `<div class="wedding-v2-story-gallery" aria-label="${escapeHtml(section.gallery.label || "Wedding inspiration gallery")}">
                <div class="wedding-v2-gallery-intro">
                  <span>${escapeHtml(section.gallery.eyebrow || "Inspiration")}</span>
                  <h3>${escapeHtml(section.gallery.title)}</h3>
                </div>
                ${imageTiles(section.gallery.items, "wedding-v2-masonry-gallery")}
              </div>`
            : ""
        }
      </div>
    </section>
  `;
}

export function WeddingChecklistProof({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "wedding-checklist")}" class="section wedding-v2-checklist-proof">
      <div class="container wedding-v2-checklist-layout">
        <div>
          ${sectionHeader(section)}
          ${actionLink(section.action)}
        </div>
        <div class="wedding-v2-checklist-grid">
          ${section.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

export function WeddingJourneyV2({ section }) {
  if (!section?.stages?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "wedding-journey")}" class="section wedding-v2-journey">
      <div class="container">
        ${sectionHeader(section, "centered")}
        <div class="wedding-v2-journey-stack">
          ${section.stages
            .map(
              (stage) => `
                <article class="wedding-v2-journey-stage">
                  ${imageFigure(stage.image, "", "wedding-v2-journey-image")}
                  <div class="wedding-v2-journey-copy">
                    <span>${escapeHtml(stage.kicker)}</span>
                    <h3>${escapeHtml(stage.title)}</h3>
                    <p>${escapeHtml(stage.copy)}</p>
                    ${stage.products?.length ? `<div>${stage.products.map((product) => `<small>${escapeHtml(product)}</small>`).join("")}</div>` : ""}
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function WhyBeSeen({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "why-be-seen")}" class="section wedding-v2-why">
      <div class="container">
        ${sectionHeader(section)}
        <div class="wedding-v2-why-list">
          ${section.items
            .map(
              (item) => `
                <article>
                  <span>${escapeHtml(item.kicker)}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.copy)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function CustomCreations({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "custom-creations")}" class="section wedding-v2-custom">
      <div class="container wedding-v2-custom-layout">
        ${imageFigure(section.image, section.imageCaption, "wedding-v2-custom-image")}
        <div>
          ${sectionHeader(section)}
          ${section.itemsTitle ? `<p class="wedding-v2-list-title">${escapeHtml(section.itemsTitle)}</p>` : ""}
          ${section.items?.length ? `<div class="wedding-v2-material-grid">${section.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
          ${section.closing ? `<p class="wedding-v2-custom-closing">${escapeHtml(section.closing)}</p>` : ""}
        </div>
      </div>
    </section>
  `;
}

export function WebsiteQrExperience({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "website-qr")}" class="section wedding-v2-qr">
      <div class="container wedding-v2-qr-layout">
        <div>
          ${sectionHeader(section)}
          ${section.itemsTitle ? `<p class="wedding-v2-list-title">${escapeHtml(section.itemsTitle)}</p>` : ""}
          <div class="wedding-v2-qr-grid">
            ${section.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          ${section.closing ? `<p class="wedding-v2-qr-closing">${escapeHtml(section.closing)}</p>` : ""}
        </div>
        ${imageFigure(section.image, section.imageCaption, "wedding-v2-qr-image")}
      </div>
    </section>
  `;
}

export function CraftsmanshipShop({ section }) {
  if (!section?.steps?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "craftsmanship")}" class="section wedding-v2-shop">
      <div class="container">
        ${sectionHeader(section, "centered")}
        <div class="wedding-v2-shop-grid">
          ${section.steps
            .map(
              (step) => `
                <article>
                  ${imageMarkup(step.image)}
                  <div>
                    <span>${escapeHtml(step.kicker)}</span>
                    <h3>${escapeHtml(step.title)}</h3>
                    <p>${escapeHtml(step.copy)}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function WeddingFinalCta({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "final-cta")}" class="section wedding-v2-final-cta">
      <div class="container wedding-v2-final-layout">
        <div>
          ${sectionLabel(section)}
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.copy)}</p>
          ${section.items?.length ? `<ul>${listItems(section.items)}</ul>` : ""}
          ${actionLink(section.action)}
        </div>
        ${imageFigure(section.image, section.imageCaption, "wedding-v2-final-image")}
      </div>
    </section>
  `;
}
