const services = [
  {
    title: "Invitation Suites",
    copy: "Save-the-dates, invitations, RSVP cards, envelopes, programs, menus, and thank-you notes that feel connected.",
  },
  {
    title: "Wedding Signage",
    copy: "Welcome signs, seating charts, directional signs, bar menus, table numbers, ceremony signs, and display boards.",
  },
  {
    title: "Favors + Details",
    copy: "Favor tags, stickers, photo moments, custom packaging, gift bags, and small pieces guests actually notice.",
  },
  {
    title: "QR + Web Support",
    copy: "QR signs, RSVP pages, wedding websites, registry links, map pages, schedule pages, and day-of info hubs.",
  },
];

const moments = [
  "Save the date",
  "Invitation",
  "Welcome sign",
  "Seating chart",
  "Menus",
  "Favors",
  "QR codes",
  "Wedding site",
];

const plannerItems = [
  "One local production partner for signs, print, favors, QR codes, and web pages",
  "Cleaner handoffs when the client has a long list and a short timeline",
  "Consistent design support across ceremony, cocktail hour, reception, and follow-up pieces",
];

const coupleItems = [
  "A practical wedding production list built from your date, venue, guest count, and style",
  "Printed, branded, and digital details that feel like one thoughtful suite",
  "Local help for design, quantities, deadlines, pickup, and final updates",
];

const steps = [
  {
    number: "01",
    title: "Bring the wedding list",
    copy: "Send the date, venue, guest count, inspiration, and the pieces you already know you need.",
  },
  {
    number: "02",
    title: "Build the production plan",
    copy: "Be Seen helps organize items, quantities, materials, artwork needs, QR links, and deadline timing.",
  },
  {
    number: "03",
    title: "Keep every detail connected",
    copy: "From welcome sign to wedding website, the finished pieces are designed to feel coordinated.",
  },
];

const campaignHeroAds = [
  {
    title: "Feed creative",
    format: "1080 x 1350",
    src: "/campaign/wedding/01-wedding-reception-feed-1080x1350.png",
    alt: "Be Seen wedding services feed ad with realistic wedding details",
  },
  {
    title: "Reel and story creative",
    format: "1080 x 1920",
    src: "/campaign/wedding/07-reception-story-1080x1920.png",
    alt: "Be Seen wedding reel ad with realistic wedding details",
  },
];

const campaignSlides = [
  {
    title: "Cover",
    src: "/campaign/wedding/09-carousel-cover-1080x1080.png",
    alt: "Wedding campaign carousel cover",
  },
  {
    title: "Invitations",
    src: "/campaign/wedding/10-carousel-invitations-1080x1080.png",
    alt: "Wedding invitation carousel slide",
  },
  {
    title: "Signs + Seating",
    src: "/campaign/wedding/11-carousel-signs-seating-1080x1080.png",
    alt: "Wedding signs and seating carousel slide",
  },
  {
    title: "Menus + Programs",
    src: "/campaign/wedding/12-carousel-menus-programs-1080x1080.png",
    alt: "Wedding menus and programs carousel slide",
  },
  {
    title: "Photos + Favors",
    src: "/campaign/wedding/13-carousel-photo-favors-1080x1080.png",
    alt: "Wedding photo printing and favors carousel slide",
  },
  {
    title: "QR + Websites",
    src: "/campaign/wedding/14-carousel-qr-websites-1080x1080.png",
    alt: "Wedding QR codes and websites carousel slide",
  },
  {
    title: "Final CTA",
    src: "/campaign/wedding/15-carousel-final-cta-1080x1080.png",
    alt: "Wedding carousel final call to action slide",
  },
];

export default function Home() {
  return (
    <main className="page">
      <div className="top-strip">
        <div className="container strip-inner">
          <span>Santa Clara + Bay Area wedding support</span>
          <a href="tel:+16692722682">(669) 272-2682</a>
        </div>
      </div>

      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#top" aria-label="Be Seen home">
            <img src="/be-seen-logo.png" alt="Be Seen Print Sign and Design" />
          </a>
          <nav className="nav-links" aria-label="Page sections">
            <a href="#services">Services</a>
            <a href="#planners">Planners</a>
            <a href="#couples">Couples</a>
            <a href="#campaign">Campaign</a>
            <a href="#quote">Quote</a>
          </nav>
          <a className="header-cta" href="#quote">
            Request Quote
          </a>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="container hero-grid">
          <div className="hero-copy-block">
            <p className="eyebrow">Wedding details, connected</p>
            <h1>
              Wedding signs, invitations, favors, QR codes, and websites.
            </h1>
            <p className="hero-copy">
              Be Seen helps wedding planners and couples turn the wedding list
              into ready-to-use materials: printed pieces, event signage,
              custom details, QR-connected pages, and wedding websites.
            </p>
            <div className="button-row">
              <a className="button" href="#quote">
                Request a wedding quote
              </a>
              <a className="button secondary" href="#services">
                See what we make
              </a>
            </div>
            <div className="hero-note">
              <strong>Bring the wedding list.</strong>
              <span>Be Seen will help organize the production list.</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Wedding detail kit preview">
            <img
              src="/wedding-hero.png"
              alt="Wedding stationery, florals, rings, ribbon, and reception details"
            />
            <div className="hero-badge">
              <span>Signs</span>
              <span>Print</span>
              <span>QR + Web</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section services-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Be Seen offerings</p>
              <h2>One local partner for the details guests see first.</h2>
            </div>
            <p>
              Keep the wedding suite coordinated from first mailing to final
              table detail, with production help for the real-world pieces and
              the digital links behind them.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section moments-section">
        <div className="container moments-grid">
          <div className="moments-copy">
            <p className="eyebrow">From yes to thank-you</p>
            <h2>Make the wedding feel like one connected experience.</h2>
            <p>
              The soft side is the design. The practical side is knowing what
              needs to be printed, built, linked, packed, and ready before the
              wedding weekend.
            </p>
          </div>
          <div className="moment-list" aria-label="Wedding moments Be Seen supports">
            {moments.map((moment) => (
              <span key={moment}>{moment}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section audience-section" aria-label="Wedding audiences">
        <div className="container audience-grid">
          <article id="planners" className="audience-card planner-card">
            <p className="card-kicker">For wedding planners</p>
            <h2>Extend your production bench without adding another vendor puzzle.</h2>
            <p>
              Be Seen can help your studio turn a client detail list into
              coordinated signs, printed pieces, favors, QR codes, and wedding
              web support.
            </p>
            <ul>
              {plannerItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article id="couples" className="audience-card couple-card">
            <p className="card-kicker">For couples getting married</p>
            <h2>Get the wedding details made without chasing five separate places.</h2>
            <p>
              Share what you are planning and Be Seen will help shape the list
              into pieces that look polished, match each other, and arrive on
              time.
            </p>
            <ul>
              {coupleItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section steps-section">
        <div className="container">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">How it works</p>
              <h2>Send the list. We help make it real.</h2>
            </div>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="campaign" className="section campaign-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Campaign creative</p>
              <h2>Facebook and Instagram ads matched to this wedding offer.</h2>
            </div>
            <p>
              The campaign extends the same landing page message into feed,
              Reels, Stories, and carousel placements with realistic wedding
              scenes and Be Seen branding.
            </p>
          </div>

          <div className="campaign-feature-grid">
            {campaignHeroAds.map((ad) => (
              <article className="campaign-feature-card" key={ad.title}>
                <div className="campaign-image-wrap">
                  <img src={ad.src} alt={ad.alt} />
                </div>
                <div className="campaign-card-copy">
                  <h3>{ad.title}</h3>
                  <p>{ad.format}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="campaign-carousel-head">
            <h3>Carousel sequence</h3>
            <a className="text-action" href="#quote">
              Send traffic to the wedding quote form
            </a>
          </div>

          <div className="campaign-slide-grid">
            {campaignSlides.map((slide) => (
              <article className="campaign-slide-card" key={slide.title}>
                <img src={slide.src} alt={slide.alt} />
                <span>{slide.title}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="section quote-section">
        <div className="container quote-grid">
          <div className="quote-copy">
            <p className="eyebrow">Request a wedding quote</p>
            <h2>Tell us what you are planning.</h2>
            <p>
              This page is ready for a GoHighLevel form embed. For now, the
              form captures the same wedding-specific lead details the Be Seen
              campaign needs.
            </p>
            <div className="contact-lines">
              <a href="tel:+16692722682">(669) 272-2682</a>
              <a href="mailto:contact@getbeseen.com">contact@getbeseen.com</a>
            </div>
          </div>

          <form className="quote-form" action="mailto:contact@getbeseen.com">
            <label>
              Full name
              <input name="name" type="text" autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              Wedding date or season
              <input name="wedding_date" type="text" />
            </label>
            <label>
              Items needed
              <select name="items_needed" defaultValue="">
                <option value="" disabled>
                  Choose the closest match
                </option>
                <option>Invitations and print pieces</option>
                <option>Signs and seating chart</option>
                <option>Favors and custom details</option>
                <option>QR codes or wedding website</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <label>
              Notes
              <textarea
                name="notes"
                rows={5}
                placeholder="Venue, guest count, quantities, design help, deadlines..."
              />
            </label>
            <button className="button form-button" type="submit">
              Send wedding request
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
