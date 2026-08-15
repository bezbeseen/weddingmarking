import { escapeHtml, listItems } from "./utils.js";

export function CTASection({ eyebrow, title, copy, items = [] }) {
  return `
    <section class="section cta-band">
      <div class="container cta-grid">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(copy)}</p>
        </div>
        <ul class="feature-list">
          ${listItems(items)}
        </ul>
      </div>
    </section>
  `;
}
