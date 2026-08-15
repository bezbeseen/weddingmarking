import { escapeHtml } from "./utils.js";
import { verticals } from "../data/verticals/index.js";

export function Header({ currentKey, topLine = "377 Laurelwood Road, Santa Clara, CA" } = {}) {
  const verticalLinks = Object.values(verticals).map((vertical) => ({
    href: vertical.path,
    label: vertical.navLabel || vertical.name,
    key: vertical.key,
  }));

  return `
    <div class="topbar">
      <div class="container topbar-inner">
        <span>${escapeHtml(topLine)}</span>
        <div class="topbar-links">
          <a href="mailto:contact@getbeseen.com">contact@getbeseen.com</a>
          <a href="tel:+16692722682">(669) 272-2682</a>
        </div>
      </div>
    </div>

    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="/" aria-label="Be Seen home">
          <img src="/assets/shared/be-seen-logo.png" alt="Be Seen Print Sign and Design">
        </a>
        <nav class="vertical-nav" aria-label="Vertical landing pages">
          ${verticalLinks
            .map(
              (link) => `
                <a href="${link.href}" ${link.key === currentKey ? 'aria-current="page"' : ""}>
                  ${escapeHtml(link.label)}
                </a>
              `,
            )
            .join("")}
        </nav>
        <a class="header-cta" href="#quote">Request Quote</a>
      </div>
    </header>
  `;
}
