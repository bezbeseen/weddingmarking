import { escapeHtml, listItems } from "./utils.js";

function sectionIntro(section) {
  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      <p>${escapeHtml(section.copy)}</p>
    </div>
  `;
}

export function TrustStrip({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section class="trust-strip" aria-label="${escapeHtml(section.label || "Trust signals")}">
      <div class="container trust-grid">
        ${section.items
          .map(
            (item) => `
              <article class="trust-item">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.copy)}</span>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

export function ChecklistSection({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "checklist")}" class="section checklist-section">
      <div class="container">
        ${sectionIntro(section)}
        <div class="checklist-grid">
          ${section.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

export function ProblemSolutionSection({ section }) {
  if (!section) return "";

  return `
    <section id="${escapeHtml(section.id || "why-one-partner")}" class="section problem-section">
      <div class="container">
        ${sectionIntro(section)}
        <div class="problem-grid">
          <article class="problem-panel">
            <h3>${escapeHtml(section.painTitle)}</h3>
            <ul>${listItems(section.painPoints || [])}</ul>
          </article>
          <article class="problem-panel solution-panel">
            <h3>${escapeHtml(section.solutionTitle)}</h3>
            <ul>${listItems(section.solutionItems || [])}</ul>
          </article>
        </div>
      </div>
    </section>
  `;
}

export function AudienceCards({ section }) {
  if (!section?.cards?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "audiences")}" class="section audience-cards-section">
      <div class="container">
        ${sectionIntro(section)}
        <div class="audience-card-grid">
          ${section.cards
            .map(
              (card) => `
                <article class="audience-card">
                  <h3>${escapeHtml(card.title)}</h3>
                  <p>${escapeHtml(card.copy)}</p>
                  ${card.items?.length ? `<ul>${listItems(card.items)}</ul>` : ""}
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function FAQSection({ section }) {
  if (!section?.items?.length) return "";

  return `
    <section id="${escapeHtml(section.id || "faq")}" class="section faq-section">
      <div class="container">
        ${sectionIntro(section)}
        <div class="faq-list">
          ${section.items
            .map(
              (item) => `
                <article class="faq-item">
                  <h3>${escapeHtml(item.question)}</h3>
                  <p>${escapeHtml(item.answer)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function FinalCTA({ section }) {
  if (!section) return "";

  return `
    <section class="section final-cta-section">
      <div class="container final-cta-box">
        <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.copy)}</p>
        <a class="button" href="${escapeHtml(section.buttonHref || "#quote")}">
          ${escapeHtml(section.buttonLabel)}
        </a>
      </div>
    </section>
  `;
}
