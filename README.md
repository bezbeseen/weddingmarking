# Be Seen Multi-Vertical Landing Pages

This is one organized Be Seen website project with separate landing pages for:

- `/construction/`
- `/event-planners/`
- `/weddings/`
- `/real-estate/`

Each page shares the same layout, components, styles, navigation, form structure, and footer. The page-specific content lives in one editable data file per vertical.

## Folder Structure

```text
be-seen-multi-vertical-site/
  index.html
  construction/index.html
  event-planners/index.html
  weddings/index.html
  real-estate/index.html
  assets/
    construction/
    event-planners/
    weddings/
    real-estate/
    shared/
  src/
    main.js
    App.js
    data/
      verticals.js
      verticals/
        construction.js
        event-planners.js
        weddings.js
        real-estate.js
        index.js
        future-verticals.js
        owner-editing-guide.js
        README.md
    components/
    styles/global.css
  docs/original-content/
  scripts/sync-route-metadata.mjs
  scripts/validate-site.mjs
```

## Where To Update Content

Most business edits should happen in one of these files:

```text
src/data/verticals/construction.js
src/data/verticals/event-planners.js
src/data/verticals/weddings.js
src/data/verticals/real-estate.js
```

Each vertical file controls that page's:

- SEO/browser page title: `meta.title`
- SEO description: `meta.description`
- Hero headline: `hero.title`
- Hero subheadline: `hero.copy`
- Hero image: `hero.image`
- Service cards
- Packages
- Showcase images
- Proof/testimonial notes
- Process steps
- Call-to-action section text
- Quote form fields
- Footer summary

The Weddings page now uses the Wedding Flagship V2 experience template. Its live conversion sections live in `src/data/verticals/weddings.js` under `flagshipV2`:

- Hero: `flagshipV2.hero`
- Hero Trust Bar: `flagshipV2.heroTrustBar`
- Real Wedding case study: `flagshipV2.realWedding`
- Bailey & Christina checklist: `flagshipV2.createdTogether`
- Wedding Journey: `flagshipV2.weddingJourney`
- Why Be Seen: `flagshipV2.whyBeSeen`
- Custom Creations: `flagshipV2.customCreations`
- Website + QR: `flagshipV2.websiteQr`
- Craftsmanship/shop section: `flagshipV2.craftsmanship`
- Final CTA: `flagshipV2.finalCta`

The quote form is still controlled by `form` in the same Weddings file.

Shared data lives in:

```text
src/data/verticals/future-verticals.js
src/data/verticals/owner-editing-guide.js
src/data/verticals/index.js
```

The old `src/data/verticals.js` file is now just a compatibility bridge. New edits should go in `src/data/verticals/`.

When you run `npm run preview` or `npm run check`, the route HTML titles and descriptions are synced from the active vertical files in `src/data/verticals/`.

## Images

Keep images grouped by vertical:

- Construction: `assets/construction/`
- Event planners: `assets/event-planners/`
- Weddings: `assets/weddings/`
- Bailey & Christina wedding project: `assets/weddings/bailey-christina/`
- Real Estate: `assets/real-estate/`
- Shared logo and shared images: `assets/shared/`

Use image paths like:

```text
/assets/construction/example-image.png
```

After adding an image file, update that vertical's content file in `src/data/verticals/`. Common fields are `hero.image.src` for the top image and `showcase.items[].image.src` for gallery images.

## Adding A Future Vertical

Future verticals are listed in `src/data/verticals/future-verticals.js`:

- Restaurants
- Retail
- Schools
- Healthcare

To make one live:

1. Copy one existing vertical file inside `src/data/verticals/`.
2. Change the key, name, path, SEO metadata, text, form fields, and image paths.
3. Import and add the new vertical in `src/data/verticals/index.js`.
4. Create a new route folder, for example `restaurants/index.html`.
5. Copy an existing route `index.html`.
6. Change the body value to the new `data-vertical` key.
7. Put that vertical's images in its matching assets folder.
8. Run `npm run check` to sync SEO metadata and confirm images/routes are connected.

## Preview

From this project folder, run:

```bash
npm run preview
```

Then open:

```text
http://localhost:4173/
http://localhost:4173/construction/
http://localhost:4173/event-planners/
http://localhost:4173/weddings/
http://localhost:4173/real-estate/
```

## Check Links And Images

Run:

```bash
npm run check
```

This syncs SEO metadata from `src/data/verticals/`, then confirms route files, image paths, SEO metadata, future vertical metadata, and owner-editable content fields are present.

## Original Content

The source content used to make this combined project is preserved in:

```text
docs/original-content/
```

Those files are reference copies only. The live website is controlled by the files in `src/`, `assets/`, and each route folder.
