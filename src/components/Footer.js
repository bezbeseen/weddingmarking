import { escapeHtml } from "./utils.js";

export function Footer({ summary = "Signs, print, promotional products, QR codes, and web pages." } = {}) {
  return `
    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <strong>Be Seen Print Sign and Design</strong>
          <p>${escapeHtml(summary)}</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/construction/">Construction</a>
          <a href="/event-planners/">Event Planners</a>
          <a href="/weddings/">Weddings</a>
          <a href="mailto:contact@getbeseen.com">Email Be Seen</a>
        </nav>
      </div>
    </footer>
  `;
}
