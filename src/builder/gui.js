import { renderVerticalPage } from "../App.js";
import { escapeHtml } from "../components/utils.js";
import {
  TEMPLATES,
  applySharedCopy,
  campaignExportPayload,
  campaignFromVertical,
  clone,
  resolvedBlast,
  resolvedPost,
  seedCampaigns,
  verticalForPreview,
} from "./campaigns.js";
import { clearDraft, mergeDrafts, saveDraft } from "./storage.js";
import { downloadDataUrl, downloadTextFile, qrPngDataUrl, qrSvg, qrSvgDataUrl } from "./qr.js";
import { verticals } from "../data/verticals/index.js";

const TABS = [
  { id: "landing", label: "Landing" },
  { id: "social", label: "Social" },
  { id: "email", label: "Email" },
  { id: "form-qr", label: "Form / QR" },
];

const state = {
  campaigns: [],
  campaignId: "weddings",
  tab: "landing",
  postIndex: 0,
  blastIndex: 0,
  status: "Staff only. Drafts stay in this browser.",
  qr: { svg: "", svgDataUrl: "", pngDataUrl: "" },
};

let previewUrl = "";
let saveTimer = 0;
let previewTimer = 0;
let els = {};

function currentCampaign() {
  return state.campaigns.find((campaign) => campaign.id === state.campaignId) || state.campaigns[0];
}

function setPath(object, path, value) {
  const parts = path.split(".");
  let cursor = object;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = Number.isInteger(Number(parts[i])) ? Number(parts[i]) : parts[i];
    if (cursor[key] == null) cursor[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cursor = cursor[key];
  }
  const last = parts[parts.length - 1];
  const lastKey = Number.isInteger(Number(last)) ? Number(last) : last;
  cursor[lastKey] = value;
}

function field(label, path, value, { type = "text", rows = 0, placeholder = "" } = {}) {
  const hint = placeholder
    ? `<span class="builder-inherit">Empty inherits: ${escapeHtml(placeholder)}</span>`
    : "";
  if (rows) {
    return `
      <label class="builder-field">
        ${escapeHtml(label)}
        ${hint}
        <textarea name="${escapeHtml(path)}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value || "")}</textarea>
      </label>
    `;
  }
  return `
    <label class="builder-field">
      ${escapeHtml(label)}
      ${hint}
      <input name="${escapeHtml(path)}" type="${escapeHtml(type)}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(placeholder)}">
    </label>
  `;
}

function shellHtml() {
  return `
    <div class="builder-app">
      <header class="builder-topbar">
        <div>
          <p class="eyebrow">Staff campaign builder</p>
          <h1>Be Seen campaign studio</h1>
        </div>
        <div class="builder-topbar-actions">
          <span class="builder-pill">Staff only</span>
          <a class="builder-quiet-link" href="/">Public site</a>
          <button class="button secondary" type="button" data-action="reset">Reset template</button>
          <button class="button secondary" type="button" data-action="copy-json">Copy JSON</button>
          <button class="button" type="button" data-action="export-json">Export JSON</button>
        </div>
      </header>

      <div class="builder-workspace">
        <aside class="builder-sidebar">
          <p class="builder-kicker">Campaigns</p>
          <div class="builder-campaign-list" data-el="campaign-list"></div>
          <p class="builder-note">Weddings is fully wired to the live V2 renderer. The other three start from the current vertical templates.</p>
        </aside>

        <section class="builder-editor-pane">
          <div class="builder-tabs" role="tablist">
            ${TABS.map(
              (tab) => `
                <button type="button" role="tab" data-action="tab" data-tab="${tab.id}">
                  ${tab.label}
                </button>
              `,
            ).join("")}
          </div>
          <div data-el="editor"></div>
        </section>

        <section class="builder-preview-pane">
          <div class="builder-preview-head">
            <div>
              <p class="builder-kicker">Live landing preview</p>
              <strong data-el="preview-label">Weddings</strong>
            </div>
            <span class="builder-status" data-el="status"></span>
          </div>
          <div class="builder-channel-preview" data-el="channel-preview"></div>
          <div class="builder-preview-frame">
            <div class="builder-preview-scale">
              <iframe data-el="preview" title="Landing page preview" sandbox="allow-same-origin"></iframe>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function paintCampaignList() {
  els.campaignList.innerHTML = state.campaigns
    .map((campaign) => {
      const current = campaign.id === state.campaignId;
      return `
        <button type="button" class="builder-campaign-btn${current ? " is-active" : ""}" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}">
          <strong>${escapeHtml(campaign.name)}</strong>
          <span>${escapeHtml(campaign.path)}</span>
        </button>
      `;
    })
    .join("");
}

function paintTabs() {
  els.root.querySelectorAll("[data-action='tab']").forEach((button) => {
    const active = button.dataset.tab === state.tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function landingFields(campaign) {
  return `
    <div class="builder-stack">
      ${field("Campaign name", "name", campaign.name)}
      <label class="builder-field">
        Template
        <select name="template">
          ${TEMPLATES.map(
            (item) =>
              `<option value="${escapeHtml(item.value)}" ${item.value === (campaign.template || "default") ? "selected" : ""}>${escapeHtml(item.label)}</option>`,
          ).join("")}
        </select>
      </label>
      ${field("Top line", "topLine", campaign.topLine)}
      ${field("Path", "path", campaign.path)}
      ${field("Meta title", "meta.title", campaign.meta.title)}
      ${field("Meta description", "meta.description", campaign.meta.description, { rows: 3 })}
      ${field("Offer statement", "offer.statement", campaign.offer.statement, { rows: 3 })}
      ${field("Primary CTA", "offer.primaryCta", campaign.offer.primaryCta)}
      ${field("Secondary CTA", "offer.secondaryCta", campaign.offer.secondaryCta)}
      ${field("Hero title", "copy.heroTitle", campaign.copy.heroTitle, { rows: 2 })}
      ${field("Hero copy", "copy.heroCopy", campaign.copy.heroCopy, { rows: 5 })}
      ${field("CTA title", "copy.ctaTitle", campaign.copy.ctaTitle)}
      ${field("CTA copy", "copy.ctaCopy", campaign.copy.ctaCopy, { rows: 4 })}
      ${field("Brand logo path", "brand.logoSrc", campaign.brand.logoSrc)}
    </div>
  `;
}

function socialFields(campaign) {
  const posts = campaign.channels.social.posts;
  const index = Math.min(state.postIndex, Math.max(posts.length - 1, 0));
  state.postIndex = index;
  const post = posts[index] || {};
  return `
    <div class="builder-stack">
      <div class="builder-row-head">
        <p class="builder-kicker">Social posts</p>
        <button class="builder-text-btn" type="button" data-action="add-post">Add post</button>
      </div>
      <div class="builder-chip-row">
        ${posts
          .map(
            (item, itemIndex) => `
              <button type="button" class="builder-chip${itemIndex === index ? " is-active" : ""}" data-action="select-post" data-index="${itemIndex}">
                ${escapeHtml(item.name || `Post ${itemIndex + 1}`)}
              </button>
            `,
          )
          .join("")}
      </div>
      ${field("Ad name", `channels.social.posts.${index}.name`, post.name)}
      ${field("Audience", `channels.social.posts.${index}.audience`, post.audience)}
      ${field("Format", `channels.social.posts.${index}.format`, post.format)}
      ${field("Primary text", `channels.social.posts.${index}.primaryText`, post.primaryText, {
        rows: 5,
        placeholder: campaign.copy.heroCopy,
      })}
      ${field("Headline", `channels.social.posts.${index}.headline`, post.headline, {
        placeholder: campaign.copy.heroTitle,
      })}
      ${field("CTA", `channels.social.posts.${index}.cta`, post.cta, {
        placeholder: campaign.offer.primaryCta,
      })}
      ${field("Asset path", `channels.social.posts.${index}.asset.src`, post.asset?.src)}
      ${field("Asset alt", `channels.social.posts.${index}.asset.alt`, post.asset?.alt)}
    </div>
  `;
}

function emailFields(campaign) {
  const blasts = campaign.channels.email.blasts;
  const index = Math.min(state.blastIndex, Math.max(blasts.length - 1, 0));
  state.blastIndex = index;
  const blast = blasts[index] || {};
  return `
    <div class="builder-stack">
      <div class="builder-row-head">
        <p class="builder-kicker">Email blasts</p>
        <button class="builder-text-btn" type="button" data-action="add-blast">Add blast</button>
      </div>
      <div class="builder-chip-row">
        ${blasts
          .map(
            (item, itemIndex) => `
              <button type="button" class="builder-chip${itemIndex === index ? " is-active" : ""}" data-action="select-blast" data-index="${itemIndex}">
                ${escapeHtml(item.name || `Blast ${itemIndex + 1}`)}
              </button>
            `,
          )
          .join("")}
      </div>
      ${field("Blast name", `channels.email.blasts.${index}.name`, blast.name)}
      ${field("Subject", `channels.email.blasts.${index}.subject`, blast.subject, {
        placeholder: campaign.copy.ctaTitle,
      })}
      ${field("Preview text", `channels.email.blasts.${index}.previewText`, blast.previewText, {
        placeholder: campaign.copy.heroCopy,
      })}
      ${field("Body", `channels.email.blasts.${index}.body`, blast.body, {
        rows: 8,
        placeholder: `${campaign.copy.heroCopy}\n\n${campaign.copy.ctaCopy}`,
      })}
      ${field("CTA label", `channels.email.blasts.${index}.ctaLabel`, blast.ctaLabel, {
        placeholder: campaign.offer.primaryCta,
      })}
      ${field("CTA href", `channels.email.blasts.${index}.ctaHref`, blast.ctaHref, {
        placeholder: `${campaign.path}#quote`,
      })}
    </div>
  `;
}

function formQrFields(campaign) {
  const form = campaign.landing.form || {};
  const fields = form.fields || [];
  return `
    <div class="builder-stack">
      <div class="builder-qr-box">
        <p class="builder-kicker">Generated QR</p>
        ${field("Destination URL", "qr.destinationUrl", campaign.qr.destinationUrl)}
        <label class="builder-check">
          <input type="checkbox" name="qr.useOnLanding" ${campaign.qr.useOnLanding ? "checked" : ""}>
          Use generated QR on the landing website/QR image
        </label>
        <label class="builder-check">
          <input type="checkbox" name="qr.useOnSocial" ${campaign.qr.useOnSocial ? "checked" : ""}>
          Use generated QR as the current social asset
        </label>
        <div class="builder-qr-preview">
          ${state.qr.svgDataUrl ? `<img src="${state.qr.svgDataUrl}" alt="Generated campaign QR code">` : "<p>Enter a destination URL to generate a QR image.</p>"}
        </div>
        <div class="builder-button-row">
          <button class="button secondary" type="button" data-action="download-qr-svg">Download SVG</button>
          <button class="button secondary" type="button" data-action="download-qr-png">Download PNG</button>
        </div>
      </div>
      ${field("Form eyebrow", "landing.form.eyebrow", form.eyebrow)}
      ${field("Form title", "landing.form.title", form.title)}
      ${field("Form copy", "landing.form.copy", form.copy, { rows: 4 })}
      ${field("Button label", "landing.form.buttonLabel", form.buttonLabel)}
      ${field("Form note", "landing.form.note", form.note)}
      <div class="builder-field-list">
        <p class="builder-kicker">Form fields</p>
        ${fields
          .map(
            (item, index) => `
              <div class="builder-mini-card">
                ${field("Label", `landing.form.fields.${index}.label`, item.label)}
                ${field("Name", `landing.form.fields.${index}.name`, item.name)}
                ${item.placeholder !== undefined ? field("Placeholder", `landing.form.fields.${index}.placeholder`, item.placeholder) : ""}
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function paintEditor() {
  const campaign = currentCampaign();
  if (state.tab === "social") els.editor.innerHTML = socialFields(campaign);
  else if (state.tab === "email") els.editor.innerHTML = emailFields(campaign);
  else if (state.tab === "form-qr") els.editor.innerHTML = formQrFields(campaign);
  else els.editor.innerHTML = landingFields(campaign);
}

function paintChannelPreview() {
  const campaign = currentCampaign();
  if (state.tab === "social") {
    const post = resolvedPost(campaign, campaign.channels.social.posts[state.postIndex] || {});
    els.channelPreview.innerHTML = `
      <article class="builder-social-card">
        <p class="builder-kicker">${escapeHtml(post.format || "Social post")}</p>
        ${post.asset?.src ? `<img src="${escapeHtml(post.asset.src)}" alt="${escapeHtml(post.asset.alt || "")}">` : ""}
        <strong>${escapeHtml(post.headline)}</strong>
        <p>${escapeHtml(post.primaryText)}</p>
        <span>${escapeHtml(post.cta)}</span>
      </article>
    `;
    return;
  }

  if (state.tab === "email") {
    const blast = resolvedBlast(campaign, campaign.channels.email.blasts[state.blastIndex] || {});
    els.channelPreview.innerHTML = `
      <article class="builder-email-card">
        <p class="builder-kicker">Email blast</p>
        <p><strong>Subject:</strong> ${escapeHtml(blast.subject)}</p>
        <p class="builder-muted">${escapeHtml(blast.previewText)}</p>
        <pre>${escapeHtml(blast.body)}</pre>
        <span>${escapeHtml(blast.ctaLabel)} → ${escapeHtml(blast.ctaHref)}</span>
        ${state.qr.svgDataUrl ? `<img src="${state.qr.svgDataUrl}" alt="Campaign QR">` : ""}
      </article>
    `;
    return;
  }

  if (state.tab === "form-qr") {
    els.channelPreview.innerHTML = `
      <article class="builder-email-card">
        <p class="builder-kicker">QR destination</p>
        <p>${escapeHtml(campaign.qr.destinationUrl || "")}</p>
        ${state.qr.svgDataUrl ? `<img src="${state.qr.svgDataUrl}" alt="Campaign QR">` : ""}
      </article>
    `;
    return;
  }

  els.channelPreview.innerHTML = "";
}

function refreshQr() {
  const campaign = currentCampaign();
  const destination = campaign.qr.destinationUrl || `https://getbeseen.com${campaign.path}`;
  try {
    state.qr.svg = qrSvg(destination);
    state.qr.svgDataUrl = qrSvgDataUrl(destination);
    state.qr.pngDataUrl = qrPngDataUrl(destination);
    campaign.qr.imageSrc = state.qr.pngDataUrl || state.qr.svgDataUrl;
    state.status = "QR image generated from the destination URL.";
  } catch (error) {
    state.qr = { svg: "", svgDataUrl: "", pngDataUrl: "" };
    campaign.qr.imageSrc = "";
    state.status = error.message;
  }
}

function paintPreview() {
  const campaign = applySharedCopy(currentCampaign());
  const vertical = verticalForPreview(campaign, campaign.qr.imageSrc || state.qr.pngDataUrl || state.qr.svgDataUrl);
  const page = renderVerticalPage(vertical, { updateDocument: false });
  const html = `<!doctype html>
<html lang="en" data-vertical="${escapeHtml(vertical.key)}">
  <head>
    <meta charset="utf-8">
    <base href="${escapeHtml(window.location.origin)}/">
    <link rel="stylesheet" href="/src/styles/global.css">
    <style>body{margin:0;pointer-events:none;}</style>
  </head>
  <body>${page}</body>
</html>`;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  els.preview.src = previewUrl;
  els.previewLabel.textContent = `${campaign.name} · ${campaign.template}`;
  els.status.textContent = state.status;
  paintChannelPreview();
}

function persistSoon() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveDraft(currentCampaign());
    state.status = "Draft saved in this browser.";
    els.status.textContent = state.status;
  }, 400);
}

function previewSoon() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(paintPreview, 120);
}

function paint() {
  paintCampaignList();
  paintTabs();
  refreshQr();
  paintEditor();
  paintPreview();
}

function openCampaign(id) {
  saveDraft(currentCampaign());
  state.campaignId = id;
  state.postIndex = 0;
  state.blastIndex = 0;
  state.status = `Opened ${currentCampaign().name}.`;
  paint();
}

function onAction(action, target) {
  const campaign = currentCampaign();
  if (action === "open-campaign") {
    openCampaign(target.dataset.id);
    return;
  }
  if (action === "tab") {
    state.tab = target.dataset.tab;
    paintTabs();
    paintEditor();
    paintChannelPreview();
    return;
  }
  if (action === "select-post") {
    state.postIndex = Number(target.dataset.index);
    paintEditor();
    paintChannelPreview();
    return;
  }
  if (action === "select-blast") {
    state.blastIndex = Number(target.dataset.index);
    paintEditor();
    paintChannelPreview();
    return;
  }
  if (action === "add-post") {
    campaign.channels.social.posts.push({
      name: `post_v${campaign.channels.social.posts.length + 1}`,
      audience: "",
      format: "Feed static",
      primaryText: "",
      headline: "",
      cta: "",
      asset: { src: "", alt: "", size: "" },
    });
    state.postIndex = campaign.channels.social.posts.length - 1;
    persistSoon();
    paintEditor();
    paintChannelPreview();
    return;
  }
  if (action === "add-blast") {
    campaign.channels.email.blasts.push({
      name: `blast_v${campaign.channels.email.blasts.length + 1}`,
      subject: "",
      previewText: "",
      body: "",
      ctaLabel: "",
      ctaHref: `${campaign.path}#quote`,
    });
    state.blastIndex = campaign.channels.email.blasts.length - 1;
    persistSoon();
    paintEditor();
    paintChannelPreview();
    return;
  }
  if (action === "reset") {
    const source = verticals[campaign.vertical];
    if (!source) return;
    const next = campaignFromVertical(source);
    const index = state.campaigns.findIndex((item) => item.id === campaign.id);
    state.campaigns[index] = next;
    clearDraft(campaign.id);
    state.status = "Reset to the current vertical template.";
    paint();
    return;
  }
  if (action === "export-json") {
    const payload = campaignExportPayload(currentCampaign(), state.qr);
    downloadTextFile(
      `be-seen-${payload.id}-campaign.json`,
      `${JSON.stringify(payload, null, 2)}\n`,
      "application/json",
    );
    state.status = "Campaign JSON downloaded.";
    els.status.textContent = state.status;
    return;
  }
  if (action === "copy-json") {
    const payload = campaignExportPayload(currentCampaign(), state.qr);
    navigator.clipboard.writeText(`${JSON.stringify(payload, null, 2)}\n`).then(
      () => {
        state.status = "Campaign JSON copied.";
        els.status.textContent = state.status;
      },
      () => {
        state.status = "Copy failed. Use Export JSON instead.";
        els.status.textContent = state.status;
      },
    );
    return;
  }
  if (action === "download-qr-svg") {
    downloadTextFile(`be-seen-${campaign.id}-qr.svg`, state.qr.svg, "image/svg+xml");
    return;
  }
  if (action === "download-qr-png") {
    downloadDataUrl(`be-seen-${campaign.id}-qr.png`, state.qr.pngDataUrl);
  }
}

function onFieldChange(target) {
  const campaign = currentCampaign();
  const name = target.name;
  if (!name) return;
  const value = target.type === "checkbox" ? target.checked : target.value;
  setPath(campaign, name, value);
  if (name === "qr.destinationUrl" || name === "qr.useOnLanding" || name === "qr.useOnSocial") {
    refreshQr();
    if (state.tab === "form-qr") {
      const box = els.editor.querySelector(".builder-qr-preview");
      if (box) {
        box.innerHTML = state.qr.svgDataUrl
          ? `<img src="${state.qr.svgDataUrl}" alt="Generated campaign QR code">`
          : "<p>Enter a destination URL to generate a QR image.</p>";
      }
    }
  }
  persistSoon();
  previewSoon();
}

export function mountBuilder(root) {
  document.title = "Staff campaign builder | Be Seen";
  document.documentElement.dataset.page = "builder";
  state.campaigns = mergeDrafts(seedCampaigns());
  if (!state.campaigns.some((campaign) => campaign.id === "weddings")) {
    state.campaignId = state.campaigns[0]?.id;
  }

  root.innerHTML = shellHtml();
  els = {
    root,
    campaignList: root.querySelector("[data-el='campaign-list']"),
    editor: root.querySelector("[data-el='editor']"),
    preview: root.querySelector("[data-el='preview']"),
    previewLabel: root.querySelector("[data-el='preview-label']"),
    channelPreview: root.querySelector("[data-el='channel-preview']"),
    status: root.querySelector("[data-el='status']"),
  };

  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || !root.contains(target)) return;
    onAction(target.dataset.action, target);
  });
  root.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea, select")) onFieldChange(event.target);
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("input[type='checkbox'], select")) onFieldChange(event.target);
  });

  paint();
}
