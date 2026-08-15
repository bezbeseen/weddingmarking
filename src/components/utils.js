export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function listItems(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function textList(items = [], className = "tag-list") {
  return `
    <div class="${className}">
      ${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

export function imageMarkup(image, className = "") {
  if (!image?.src) return "";

  return `
    <img
      class="${className}"
      src="${escapeHtml(image.src)}"
      alt="${escapeHtml(image.alt || "")}"
      loading="${image.loading || "lazy"}"
    >
  `;
}
