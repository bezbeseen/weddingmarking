import { escapeHtml, listItems } from "./utils.js";

export function ServiceCards({ eyebrow, title, copy, cards = [], id = "services", dark = false }) {
  return `
    <section id="${escapeHtml(id)}" class="section ${dark ? "dark-section" : ""}">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <p>${escapeHtml(copy)}</p>
        </div>
        <div class="service-grid">
          ${cards
            .map(
              (card) => `
                <article class="service-card">
                  <h3>${escapeHtml(card.title)}</h3>
                  ${card.copy ? `<p>${escapeHtml(card.copy)}</p>` : ""}
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
