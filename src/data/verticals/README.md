# Vertical Content Files

Edit one file per landing page:

- `construction.js` controls `/construction/`
- `event-planners.js` controls `/event-planners/`
- `weddings.js` controls `/weddings/`
- `real-estate.js` controls `/real-estate/`

Each vertical file controls that page's SEO title and description, hero copy, services, gallery images, proof notes, process steps, call-to-action text, quote form wording, and footer summary.

The Weddings page uses the Wedding Flagship V2 experience template. Its live editable sections are in `weddings.js` under `flagshipV2`: `hero`, `heroTrustBar`, `realWedding`, `createdTogether`, `weddingJourney`, `whyBeSeen`, `customCreations`, `websiteQr`, `craftsmanship`, and `finalCta`. The quote form still lives in `form`.

When adding images, place the image in the matching `assets/` folder first, then update `hero.image.src` or `showcase.items[].image.src` in that vertical file.

Bailey & Christina project images live in `assets/weddings/bailey-christina/` and are used by the Weddings V2 sections in `weddings.js`.

Shared lists live here too:

- `future-verticals.js`
- `owner-editing-guide.js`
- `index.js` combines all active verticals for the website.
