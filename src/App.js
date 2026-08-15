import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HeroSection } from "./components/HeroSection.js";
import { ServiceCards } from "./components/ServiceCards.js";
import { CTASection } from "./components/CTASection.js";
import { ProcessSteps } from "./components/ProcessSteps.js";
import { GalleryShowcase } from "./components/GalleryShowcase.js";
import { Testimonials } from "./components/Testimonials.js";
import { ContactForm } from "./components/ContactForm.js";
import {
  AudienceCards,
  ChecklistSection,
  FAQSection,
  FinalCTA,
  ProblemSolutionSection,
  TrustStrip,
} from "./components/ConversionSections.js";
import {
  ConsultationCTA,
  FeaturedStory,
  InspirationGallery,
  ResourceCenter,
  TrustStrip as WeddingFlagshipTrustStrip,
  WeddingFlagshipHero,
  WeddingJourney,
  WhyChooseUs,
} from "./components/WeddingFlagshipSections.js";
import {
  CraftsmanshipShop,
  CustomCreations,
  HeroTrustBar,
  RealWedding,
  WebsiteQrExperience,
  WeddingChecklistProof,
  WeddingFinalCta,
  WeddingJourneyV2,
  WeddingV2Hero,
  WhyBeSeen,
} from "./components/WeddingFlagshipV2Sections.js";
import { escapeHtml, imageMarkup } from "./components/utils.js";
import { futureVerticals, ownerEditingGuide, verticals } from "./data/verticals/index.js";

function setMeta(meta = {}) {
  if (meta.title) {
    document.title = meta.title;
  }

  if (meta.description) {
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.append(description);
    }
    description.setAttribute("content", meta.description);
  }
}

function renderVerticalPage(vertical) {
  setMeta(vertical.meta);
  document.documentElement.dataset.vertical = vertical.key;

  if (vertical.template === "wedding-flagship-v2") {
    const flagship = vertical.flagshipV2 || {};

    return `
      ${Header({ currentKey: vertical.key, topLine: vertical.topLine })}
      <main class="vertical-page wedding-v2-page" data-vertical="${escapeHtml(vertical.key)}">
        ${WeddingV2Hero({ section: flagship.hero })}
        ${HeroTrustBar({ section: flagship.heroTrustBar })}
        ${RealWedding({ section: flagship.realWedding })}
        ${WeddingChecklistProof({ section: flagship.createdTogether })}
        ${WeddingJourneyV2({ section: flagship.weddingJourney })}
        ${WhyBeSeen({ section: flagship.whyBeSeen })}
        ${CustomCreations({ section: flagship.customCreations })}
        ${WebsiteQrExperience({ section: flagship.websiteQr })}
        ${CraftsmanshipShop({ section: flagship.craftsmanship })}
        ${WeddingFinalCta({ section: flagship.finalCta })}
        ${ContactForm({ vertical })}
      </main>
      ${Footer({ summary: vertical.footerSummary })}
    `;
  }

  if (vertical.template === "wedding-flagship-v1") {
    const flagship = vertical.flagship || {};

    return `
      ${Header({ currentKey: vertical.key, topLine: vertical.topLine })}
      <main class="vertical-page wedding-flagship-page" data-vertical="${escapeHtml(vertical.key)}">
        ${WeddingFlagshipHero({ section: flagship.hero })}
        ${WeddingFlagshipTrustStrip({ section: flagship.trustStrip })}
        ${FeaturedStory({ section: flagship.featuredStory })}
        ${WeddingJourney({ section: flagship.weddingJourney })}
        ${WhyChooseUs({ section: flagship.whyChooseUs })}
        ${InspirationGallery({ section: flagship.inspirationGallery })}
        ${ResourceCenter({ section: flagship.resourceCenter })}
        ${ConsultationCTA({ section: flagship.consultationCta })}
        ${ContactForm({ vertical })}
      </main>
      ${Footer({ summary: vertical.footerSummary })}
    `;
  }

  if (vertical.template === "flagship") {
    return `
      ${Header({ currentKey: vertical.key, topLine: vertical.topLine })}
      <main class="vertical-page flagship-page" data-vertical="${escapeHtml(vertical.key)}">
        ${HeroSection({ vertical })}
        ${TrustStrip({ section: vertical.trustStrip })}
        ${ChecklistSection({ section: vertical.everything })}
        ${ProblemSolutionSection({ section: vertical.whyOnePartner })}
        ${GalleryShowcase(vertical.showcase)}
        ${ProcessSteps(vertical.process)}
        ${AudienceCards({ section: vertical.audiences })}
        ${FAQSection({ section: vertical.faq })}
        ${FinalCTA({ section: vertical.finalCta })}
        ${ContactForm({ vertical })}
      </main>
      ${Footer({ summary: vertical.footerSummary })}
    `;
  }

  return `
    ${Header({ currentKey: vertical.key, topLine: vertical.topLine })}
    <main class="vertical-page" data-vertical="${escapeHtml(vertical.key)}">
      ${HeroSection({ vertical })}
      ${ServiceCards({ ...vertical.moments, id: "moments" })}
      ${ServiceCards({ ...vertical.services, id: "services" })}
      ${ServiceCards({ ...vertical.packages, id: "packages", dark: true })}
      ${CTASection(vertical.cta)}
      ${ProcessSteps(vertical.process)}
      ${GalleryShowcase(vertical.showcase)}
      ${Testimonials(vertical.testimonials)}
      ${ContactForm({ vertical })}
    </main>
    ${Footer({ summary: vertical.footerSummary })}
  `;
}

function renderHomePage() {
  setMeta({
    title: "Be Seen Marketing Verticals",
    description:
      "One organized Be Seen website project with shared components and separate landing pages for each marketing vertical.",
  });
  document.documentElement.dataset.vertical = "home";

  const activeVerticals = Object.values(verticals);

  return `
    ${Header({ topLine: "One Be Seen website project for multiple marketing verticals" })}
    <main class="home-page">
      <section class="hub-hero">
        <div class="container hub-grid">
          <div>
            <p class="eyebrow">Be Seen verticals</p>
            <h1>One organized landing page system for focused marketing pages.</h1>
            <p>
              The active vertical pages now share the same components, styles,
              forms, layout, and update pattern while keeping each page's
              content and images separate.
            </p>
          </div>
          <div class="hub-panel">
            <strong>Live routes</strong>
            ${activeVerticals
              .map((vertical) => `<a href="${escapeHtml(vertical.path)}">${escapeHtml(vertical.path.replace(/\/$/, ""))}</a>`)
              .join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head compact">
            <div>
              <p class="eyebrow">Current verticals</p>
              <h2>${activeVerticals.length} landing pages, one shared system.</h2>
            </div>
          </div>
          <div class="hub-card-grid">
            ${activeVerticals
              .map(
                (vertical) => `
                  <article class="hub-card">
                    <div class="hub-card-image">
                      ${imageMarkup(vertical.hero.image)}
                    </div>
                    <h3>${escapeHtml(vertical.name)}</h3>
                    <p>${escapeHtml(vertical.hero.copy)}</p>
                    <a class="text-action" href="${escapeHtml(vertical.path)}">Open page</a>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section future-section">
        <div class="container">
          <div class="section-head">
            <div>
              <p class="eyebrow">Future verticals</p>
              <h2>Ready for the next marketing lanes.</h2>
            </div>
            <p>
              These are set up as planning entries in the content file, so adding
              them later follows the same repeatable pattern.
            </p>
          </div>
          <div class="future-grid">
            ${futureVerticals
              .map(
                (vertical) => `
                  <article class="future-card">
                    <h3>${escapeHtml(vertical.name)}</h3>
                    <p>${escapeHtml(vertical.startingFocus)}</p>
                    <span>${escapeHtml(vertical.assetFolder)}</span>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section guide-section">
        <div class="container guide-box">
          <div>
            <p class="eyebrow">Editing guide</p>
            <h2>Where a non-developer should make updates.</h2>
          </div>
          <ul class="feature-list">
            ${ownerEditingGuide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}

export function renderApp(pageKey) {
  if (pageKey === "home") {
    return renderHomePage();
  }

  const vertical = verticals[pageKey];
  if (!vertical) {
    return renderHomePage();
  }

  return renderVerticalPage(vertical);
}
