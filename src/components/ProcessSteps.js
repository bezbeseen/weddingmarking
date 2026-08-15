import { escapeHtml } from "./utils.js";

export function ProcessSteps({ eyebrow, title, copy, steps = [] }) {
  return `
    <section id="process" class="section process-section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <p>${escapeHtml(copy)}</p>
        </div>
        <div class="process-grid">
          ${steps
            .map(
              (step, index) => `
                <article class="step-card">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <h3>${escapeHtml(step.title)}</h3>
                  <p>${escapeHtml(step.copy)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
