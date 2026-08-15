import { escapeHtml } from "./utils.js";

export function Testimonials({ eyebrow, title, copy, items = [] }) {
  return `
    <section id="testimonials" class="section proof-section">
      <div class="container">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <p>${escapeHtml(copy)}</p>
        </div>
        <div class="proof-grid">
          ${items
            .map(
              (item) => `
                <figure class="proof-card">
                  <blockquote>${escapeHtml(item.quote)}</blockquote>
                  <figcaption>${escapeHtml(item.name)}</figcaption>
                </figure>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
