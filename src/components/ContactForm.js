import { escapeHtml } from "./utils.js";

function fieldMarkup(field) {
  if (field.type === "textarea") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <textarea name="${escapeHtml(field.name)}" rows="${field.rows || 5}" placeholder="${escapeHtml(field.placeholder || "")}"></textarea>
      </label>
    `;
  }

  if (field.type === "select") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <select name="${escapeHtml(field.name)}">
          <option value="">Choose the closest match</option>
          ${(field.options || []).map((option) => `<option>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  return `
    <label>
      ${escapeHtml(field.label)}
      <input
        name="${escapeHtml(field.name)}"
        type="${escapeHtml(field.type || "text")}"
        autocomplete="${escapeHtml(field.autocomplete || "")}"
        placeholder="${escapeHtml(field.placeholder || "")}"
      >
    </label>
  `;
}

export function ContactForm({ vertical }) {
  const form = vertical.form;

  return `
    <section id="quote" class="section quote-section">
      <div class="container quote-grid">
        <div class="quote-copy">
          <p class="eyebrow">${escapeHtml(form.eyebrow)}</p>
          <h2>${escapeHtml(form.title)}</h2>
          <p>${escapeHtml(form.copy)}</p>
          <div class="contact-lines">
            <a href="tel:+16692722682">(669) 272-2682</a>
            <a href="mailto:contact@getbeseen.com">contact@getbeseen.com</a>
          </div>
        </div>

        <form class="quote-form" action="mailto:contact@getbeseen.com" method="post" enctype="text/plain">
          ${form.fields.map(fieldMarkup).join("")}
          <input type="hidden" name="vertical" value="${escapeHtml(vertical.name)}">
          <button class="button form-button" type="submit">${escapeHtml(form.buttonLabel)}</button>
          <p class="form-note">${escapeHtml(form.note)}</p>
        </form>
      </div>
    </section>
  `;
}
