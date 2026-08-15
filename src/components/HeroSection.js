import { escapeHtml, imageMarkup } from "./utils.js";

export function HeroSection({ vertical }) {
  const hero = vertical.hero;

  return `
    <section id="top" class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy-block">
          <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
          <h1>${escapeHtml(hero.title)}</h1>
          <p class="hero-copy">${escapeHtml(hero.copy)}</p>
          <div class="button-row">
            <a class="button" href="#quote">${escapeHtml(hero.primaryCta)}</a>
            ${
              hero.secondaryCta
                ? `<a class="button secondary" href="${escapeHtml(hero.secondaryHref || "#services")}">
                    ${escapeHtml(hero.secondaryCta)}
                  </a>`
                : ""
            }
          </div>
          <div class="hero-note">
            <strong>${escapeHtml(hero.noteTitle)}</strong>
            <span>${escapeHtml(hero.noteCopy)}</span>
          </div>
        </div>
        <div class="hero-media" aria-label="${escapeHtml(hero.image.alt)}">
          ${imageMarkup({ ...hero.image, loading: "eager" })}
          <div class="hero-badge-row">
            ${hero.badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}
