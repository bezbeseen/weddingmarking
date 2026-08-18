import { verticals } from "../data/verticals/index.js";

export const STORAGE_KEY = "be-seen-builder-drafts-v1";

export const TEMPLATES = [
  { value: "wedding-flagship-v2", label: "Wedding Flagship V2" },
  { value: "wedding-flagship-v1", label: "Wedding Flagship V1" },
  { value: "flagship", label: "Flagship conversion" },
  { value: "default", label: "Default vertical" },
];

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultDestination(vertical) {
  return `https://getbeseen.com${vertical.path}`;
}

function seedSocial(vertical) {
  if (vertical.key === "weddings") {
    return [
      {
        name: "wedding_reception_feed_v1",
        audience: "Couples / engaged",
        format: "Feed vertical 1080x1350",
        primaryText:
          "Planning a Bay Area wedding? Be Seen helps bring the website, invitations, signs, seating chart, QR codes, and day-of details together through one local team.",
        headline: "Wedding Details Guests Will See, Hold, and Scan",
        cta: "Start Planning My Wedding",
        asset: {
          src: "/assets/weddings/01-wedding-reception-feed-1080x1350.png",
          alt: "Wedding reception campaign creative",
          size: "1080x1350",
        },
      },
      {
        name: "ceremony_reception_square_v1",
        audience: "Wedding planners",
        format: "Square 1080x1080",
        primaryText:
          "Keep client wedding details connected from ceremony to reception. Invitation suites, welcome signs, seating charts, menus, favors, and QR-linked pages can all come from one local production partner.",
        headline: "Wedding Details That Feel Connected",
        cta: "Learn More",
        asset: {
          src: "/assets/weddings/03-ceremony-to-reception-square-1080x1080.png",
          alt: "Ceremony to reception wedding campaign creative",
          size: "1080x1080",
        },
      },
      {
        name: "reception_story_v1",
        audience: "Couples / venues",
        format: "Stories/Reels 1080x1920",
        primaryText:
          "Bring the date, venue, guest count, and wish list. Be Seen helps turn them into a wedding website, printed pieces, signs, QR codes, and day-of details.",
        headline: "Bring the Wedding List",
        cta: "Get Quote",
        asset: {
          src: "/assets/weddings/07-reception-story-1080x1920.png",
          alt: "Wedding reception story campaign creative",
          size: "1080x1920",
        },
      },
    ];
  }

  if (vertical.key === "event-planners") {
    return [
      {
        name: "broad_event_partner_static_v1",
        audience: "Broad local",
        format: "Feed static 1080x1350",
        primaryText:
          "Planning an event in the Bay Area? Be Seen helps coordinate the printed, branded, and digital details: welcome signs, banners, invitations, giveaways, QR codes, and event pages. Tell us what you are planning and we will help turn it into a production list.",
        headline: "Event Signs, Print, Giveaways and Websites",
        cta: "Get Quote",
        asset: {
          src: "/assets/event-planners/01-broad-event-partner-feed-1080x1350.png",
          alt: "Broad event partner campaign creative",
          size: "1080x1350",
        },
      },
      {
        name: "corporate_guest_ready_static_v1",
        audience: "Corporate events",
        format: "Feed static 1080x1350",
        primaryText:
          "Your sponsor list, floor plan, guest count, and deadline all need to become real materials. Be Seen can help with check-in signage, step-and-repeat backdrops, badges, lanyards, programs, giveaways, and registration pages.",
        headline: "Make Your Conference Guest-Ready",
        cta: "Get Quote",
        asset: {
          src: "/assets/event-planners/02-corporate-conference-feed-1080x1350.png",
          alt: "Corporate conference event campaign creative",
          size: "1080x1350",
        },
      },
      {
        name: "qr_connected_reel_v1",
        audience: "Broad local",
        format: "Reel/Story 1080x1920",
        primaryText:
          "Connect printed event pieces to RSVP, registration, donation, schedule, sponsor, or menu pages with QR codes built into the design.",
        headline: "Add QR Codes to Event Materials",
        cta: "Learn More",
        asset: {
          src: "/assets/event-planners/07-qr-connected-story-1080x1920.png",
          alt: "QR-connected event story creative",
          size: "1080x1920",
        },
      },
    ];
  }

  const images = [
    vertical.hero?.image,
    ...(vertical.showcase?.items || []).map((item) => item.image),
  ].filter((image) => image?.src);

  const formats = [
    { format: "Feed vertical 1080x1350", size: "1080x1350" },
    { format: "Square 1080x1080", size: "1080x1080" },
    { format: "Stories/Reels 1080x1920", size: "1080x1920" },
  ];

  return formats.map((item, index) => ({
    name: `${vertical.key}_post_v${index + 1}`,
    audience: "Broad local",
    format: item.format,
    primaryText: "",
    headline: "",
    cta: "",
    asset: {
      src: images[index % images.length]?.src || "",
      alt: images[index % images.length]?.alt || `${vertical.name} campaign creative`,
      size: item.size,
    },
  }));
}

function seedEmail(vertical) {
  const heroCopy = vertical.flagshipV2?.hero?.copy || vertical.hero?.copy || "";
  const ctaTitle = vertical.flagshipV2?.finalCta?.title || vertical.cta?.title || "";
  const ctaCopy = vertical.flagshipV2?.finalCta?.copy || vertical.cta?.copy || "";
  const cta = vertical.flagshipV2?.hero?.primaryAction?.label || vertical.hero?.primaryCta || "";
  return [
    {
      name: `${vertical.navLabel || vertical.name} intro blast`,
      subject: ctaTitle,
      previewText: heroCopy,
      body: `${heroCopy}\n\n${ctaCopy}`.trim(),
      ctaLabel: cta,
      ctaHref: `${vertical.path}#quote`,
    },
  ];
}

export function campaignFromVertical(vertical) {
  const landing = clone(vertical);
  const template = landing.template || "default";
  const heroTitle = landing.flagshipV2?.hero?.title || landing.hero?.title || "";
  const heroCopy = landing.flagshipV2?.hero?.copy || landing.hero?.copy || "";
  const primaryCta =
    landing.flagshipV2?.hero?.primaryAction?.label || landing.hero?.primaryCta || landing.form?.buttonLabel || "";
  const secondaryCta =
    landing.flagshipV2?.hero?.secondaryAction?.label || landing.hero?.secondaryCta || "";

  return {
    id: landing.key,
    name: landing.name,
    vertical: landing.key,
    template,
    path: landing.path,
    topLine: landing.topLine || "",
    meta: clone(landing.meta || { title: "", description: "" }),
    offer: {
      statement: landing.hero?.noteCopy || landing.cta?.copy || "",
      primaryCta,
      secondaryCta,
    },
    brand: {
      logoSrc: "/assets/shared/be-seen-logo.png",
    },
    copy: {
      heroTitle,
      heroCopy,
      ctaTitle: landing.flagshipV2?.finalCta?.title || landing.cta?.title || "",
      ctaCopy: landing.flagshipV2?.finalCta?.copy || landing.cta?.copy || "",
    },
    landing,
    channels: {
      social: { posts: seedSocial(landing) },
      email: { blasts: seedEmail(landing) },
      form: landing.form,
    },
    qr: {
      destinationUrl: defaultDestination(landing),
      useOnLanding: false,
      useOnSocial: false,
    },
  };
}

export function applySharedCopy(campaign) {
  const next = clone(campaign);
  const landing = next.landing;
  landing.name = next.name;
  landing.path = next.path;
  landing.topLine = next.topLine;
  landing.template = next.template === "default" ? undefined : next.template;
  landing.meta = clone(next.meta);
  landing.hero = landing.hero || {};
  landing.hero.title = next.copy.heroTitle;
  landing.hero.copy = next.copy.heroCopy;
  landing.hero.primaryCta = next.offer.primaryCta;
  landing.hero.secondaryCta = next.offer.secondaryCta;
  if (next.offer.statement) landing.hero.noteCopy = next.offer.statement;

  landing.cta = landing.cta || {};
  landing.cta.title = next.copy.ctaTitle;
  landing.cta.copy = next.copy.ctaCopy;

  if (landing.flagshipV2?.hero) {
    landing.flagshipV2.hero.title = next.copy.heroTitle;
    landing.flagshipV2.hero.copy = next.copy.heroCopy;
    landing.flagshipV2.hero.primaryAction = {
      ...(landing.flagshipV2.hero.primaryAction || {}),
      label: next.offer.primaryCta,
    };
    landing.flagshipV2.hero.secondaryAction = {
      ...(landing.flagshipV2.hero.secondaryAction || {}),
      label: next.offer.secondaryCta,
    };
  }

  if (landing.flagshipV2?.finalCta) {
    landing.flagshipV2.finalCta.title = next.copy.ctaTitle;
    landing.flagshipV2.finalCta.copy = next.copy.ctaCopy;
    if (next.offer.primaryCta) {
      landing.flagshipV2.finalCta.buttonLabel = next.offer.primaryCta;
    }
  }

  if (landing.flagship?.hero) {
    landing.flagship.hero.title = next.copy.heroTitle;
    landing.flagship.hero.copy = next.copy.heroCopy;
    landing.flagship.hero.primaryAction = {
      ...(landing.flagship.hero.primaryAction || {}),
      label: next.offer.primaryCta,
    };
    landing.flagship.hero.secondaryAction = {
      ...(landing.flagship.hero.secondaryAction || {}),
      label: next.offer.secondaryCta,
    };
  }

  next.channels.form = landing.form;
  return next;
}

export function resolvedPost(campaign, post) {
  return {
    ...post,
    primaryText: (post.primaryText || "").trim() || campaign.copy.heroCopy,
    headline: (post.headline || "").trim() || campaign.copy.heroTitle,
    cta: (post.cta || "").trim() || campaign.offer.primaryCta,
    asset: {
      ...(post.asset || {}),
      src:
        campaign.qr?.useOnSocial && campaign.qr?.imageSrc
          ? campaign.qr.imageSrc
          : post.asset?.src || "",
    },
  };
}

export function resolvedBlast(campaign, blast) {
  return {
    ...blast,
    subject: (blast.subject || "").trim() || campaign.copy.ctaTitle || campaign.copy.heroTitle,
    previewText: (blast.previewText || "").trim() || campaign.copy.heroCopy,
    body: (blast.body || "").trim() || `${campaign.copy.heroCopy}\n\n${campaign.copy.ctaCopy}`.trim(),
    ctaLabel: (blast.ctaLabel || "").trim() || campaign.offer.primaryCta,
    ctaHref: (blast.ctaHref || "").trim() || `${campaign.path}#quote`,
  };
}

export function verticalForPreview(campaign, qrImageSrc = "") {
  const synced = applySharedCopy(campaign);
  const vertical = synced.landing;
  vertical.key = synced.vertical;
  vertical.template = synced.template === "default" ? undefined : synced.template;
  if (synced.qr?.useOnLanding && qrImageSrc && vertical.flagshipV2?.websiteQr?.image) {
    vertical.flagshipV2.websiteQr.image = {
      ...vertical.flagshipV2.websiteQr.image,
      src: qrImageSrc,
      alt: "Generated campaign QR code",
    };
  }
  return vertical;
}

export function seedCampaigns() {
  return Object.values(verticals).map((vertical) => campaignFromVertical(vertical));
}

export function campaignExportPayload(campaign, qr = {}) {
  const synced = applySharedCopy(campaign);
  synced.channels.social.posts = synced.channels.social.posts.map((post) => resolvedPost(synced, post));
  synced.channels.email.blasts = synced.channels.email.blasts.map((blast) => resolvedBlast(synced, blast));
  synced.qr = {
    destinationUrl: synced.qr.destinationUrl,
    useOnLanding: Boolean(synced.qr.useOnLanding),
    useOnSocial: Boolean(synced.qr.useOnSocial),
    svg: qr.svg || "",
    pngDataUrl: qr.pngDataUrl || "",
  };
  return synced;
}
