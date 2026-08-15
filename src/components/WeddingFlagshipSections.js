import { escapeHtml, imageMarkup, listItems } from "./utils.js";

function sectionHeading(section) {
  return `
    <div class="wedding-v1-section-head">
      <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
      <h2>${escapeHtml(section.title)}</h2>
      ${section.copy ? `<p>${escapeHtml(section.copy)}</p>` : ""}
    </div>
  `;
}

function actionLink(action = {}) {
  if (!action.label) return "";

  return `
    <a class="${escapeHtml(action.className || "button")}" href="${escapeHtml(action.href || "#quote")}">
      ${escapeHtml(action.label)}
    </a>
  `;
}

export function WeddingFlagshipHero({ section }) {
  if (!section) return "";

  return `
    <section class="wedding-v1-hero" id="top">
      <div class="container wedding-v1-hero-grid">
        <div class="wedding-v1-hero-copy">
          <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
          <h1>${escapeHtml(section.title)}</h1>
          <p class="wedding-v1-hero-text">${escapeHtml(section.copy)}</p>
          <div class="button-row">
            ${actionLink(section.primaryAction)}
            ${actionLink({ ...section.secondaryAction, className: "button secondary" })}
          </div>
          ${
            section.promises?.length
              ? `<ul class="wedding-v1-hero-promises">${listItems(section.promises)}</ul>`
              : ""
          }
        </div>
        <figure class="wedding-v1-hero-visual">
          ${imageMarkup({ ...section.image, loading: "eager" })}
          ${
            section.caption
              ? `<figcaption>
                  <strong>${escapeHtml(section.caption.title)}</strong>
                  <span>${escapeHtml(section.caption.copy)}</span>
                </figcaption>`
              : ""
          }
        </figure>
      </div>
    </section>
  `;
}

export function TrustStrip({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section class="wedding-v1-trust-strip" aria-label="${escapeHtml(section.label || "Trust signals")}">
      <div class="container wedding-v1-trust-grid">
        ${section.items
          .map(
            (item) => `
              <article class="wedding-v1-trust-item">
                <span>${escapeHtml(item.kicker)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.copy)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function FeaturedStory({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "featured-story")}" class="section wedding-v1-featured-story">
      <div class="container wedding-v1-story-grid">
        <div class="wedding-v1-story-copy">
          ${sectionHeading(section)}
          <div class="wedding-v1-project-meta">
            ${(section.details || [])
              .map(
                (detail) => `
                  <div>
                    <span>${escapeHtml(detail.label)}</span>
                    <strong>${escapeHtml(detail.value)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
          ${
            section.outcomes?.length
              ? `<ul class="wedding-v1-outcome-list">${listItems(section.outcomes)}</ul>`
              : ""
          }
          ${actionLink(section.action)}
        </div>
        <div class="wedding-v1-story-media">
          ${imageMarkup(section.mainImage)}
          <div class="wedding-v1-story-stack">
            ${(section.supportingImages || [])
              .map((image) => imageMarkup(image))
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function WeddingJourney({ section }) {
  if (!section?.steps?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "wedding-journey")}" class="section wedding-v1-journey">
      <div class="container">
        ${sectionHeading(section)}
        <div class="wedding-v1-journey-grid">
          ${section.steps
            .map(
              (step, index) => `
                <article class="wedding-v1-journey-step">
                  ${imageMarkup(step.image)}
                  <div>
                    <span>${String(index + 1).padStart(2, "0")} / ${escapeHtml(step.phase)}</span>
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

export function WhyChooseUs({ section }) {
  if (!section?.cards?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "why-choose-us")}" class="section wedding-v1-why">
      <div class="container">
        ${sectionHeading(section)}
        <div class="wedding-v1-why-grid">
          ${section.cards
            .map(
              (card) => `
                <article class="wedding-v1-why-card">
                  <span>${escapeHtml(card.kicker)}</span>
                  <h3>${escapeHtml(card.title)}</h3>
                  <p>${escapeHtml(card.copy)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
        ${
          section.note
            ? `<div class="wedding-v1-why-note">
                <strong>${escapeHtml(section.note.title)}</strong>
                <p>${escapeHtml(section.note.copy)}</p>
              </div>`
            : ""
        }
      </div>
    </section>
  `;
}

export function InspirationGallery({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "inspiration-gallery")}" class="section wedding-v1-gallery">
      <div class="container">
        ${sectionHeading(section)}
        <div class="wedding-v1-gallery-grid">
          ${section.items
            .map(
              (item) => `
                <figure class="wedding-v1-gallery-item">
                  ${imageMarkup(item.image)}
                  <figcaption>
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.copy)}</span>
                  </figcaption>
                </figure>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function ResourceCenter({ section }) {
  if (!section?.resources?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "resource-center")}" class="section wedding-v1-resources">
      <div class="container">
        ${sectionHeading(section)}
        <div class="wedding-v1-resource-grid">
          ${section.resources
            .map(
              (resource) => `
                <article class="wedding-v1-resource-card">
                  <span>${escapeHtml(resource.kicker)}</span>
                  <h3>${escapeHtml(resource.title)}</h3>
                  <p>${escapeHtml(resource.copy)}</p>
                  ${resource.items?.length ? `<ul>${listItems(resource.items)}</ul>` : ""}
                  ${actionLink({ label: resource.actionLabel, href: resource.actionHref, className: "text-action" })}
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function ConsultationCTA({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "consultation")}" class="section wedding-v1-consultation">
      <div class="container wedding-v1-consultation-grid">
        <div>
          <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.copy)}</p>
          ${section.items?.length ? `<ul>${listItems(section.items)}</ul>` : ""}
          ${actionLink(section.action)}
        </div>
        <figure>
          ${imageMarkup(section.image)}
          ${section.caption ? `<figcaption>${escapeHtml(section.caption)}</figcaption>` : ""}
        </figure>
      </div>
    </section>
  `;
}
