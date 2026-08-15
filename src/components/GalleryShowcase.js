import { escapeHtml, imageMarkup } from "./utils.js";

export function GalleryShowcase({ eyebrow, title, copy, items = [] }) {
  return `
    <section id="showcase" class="section showcase-section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <p>${escapeHtml(copy)}</p>
        </div>
        <div class="showcase-grid">
          ${items
            .map(
              (item) => `
                <article class="showcase-card">
                  <div class="showcase-image">
                    ${imageMarkup(item.image)}
                  </div>
                  <div class="showcase-copy">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.copy)}</p>
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
