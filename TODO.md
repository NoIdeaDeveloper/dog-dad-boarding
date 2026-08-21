# Dog Dad Boarding — Remaining Production Checklist

This file tracks placeholder values and assets that still need to be replaced with real production content before launch.

## Images

| Location | File / URL | What to replace with | Notes |
|----------|------------|----------------------|-------|
| Hero | `https://placehold.co/1600x900/5A6B38/FAF6EC?text=Hero+Image+—+Replace+With+Real+Photo` | Real hero photo of happy dogs at your facility | Update in `index.html` line ~36 and inside the hero `<img>`. Keep 1600×900 or 16:9 ratio for `preload` to match. |
| About owner | `https://placehold.co/600x700/8A9A5B/FAF6EC?text=Owner+Photo+—+Replace+With+Real+Photo` | Real owner photo | `index.html` About section. Recommended 600×700 or 6:7 ratio. |
| Gallery photo 1 | `Photo 1` placeholders (`800x450` thumb + `1200x675` full) | Real group-play photo | `index.html` gallery. Keep same aspect ratios so CSS grid stays intact. |
| Gallery photo 2 | `Photo 2` placeholders (`400x400` thumb + `800x800` full) | Real resting dog photo | Square aspect ratio. |
| Gallery photo 3 | `Photo 3` placeholders (`400x400` thumb + `800x800` full) | Real dog-walk photo | Square aspect ratio. |
| Gallery photo 4 | `Photo 4` placeholders (`400x400` thumb + `800x800` full) | Real grooming photo | Square aspect ratio. |
| Gallery photo 5 | `Photo 5` placeholders (`400x400` thumb + `800x800` full) | Real happy-dog portrait | Square aspect ratio. |
| Gallery photo 6 | `Photo 6` placeholders (`800x450` thumb + `1200x675` full) | Real group-play / yard photo | Wide 16:9 ratio. |
| Resource thumbnails (3) | `https://placehold.co/400x250/...?text=Coming+Soon` | Real blog/guide thumbnails | 400×250 or 8:5 ratio. Cards are intentionally **non-link `<article>` teasers** with a "Coming Soon" badge until posts exist — restore `<a href="/blog/…"` wrappers (and remove the `resource-card--soon` class + badge span) when the posts are written. |
| Testimonial avatars | `https://placehold.co/48x48/...` initials | Real customer photos (or keep initials) | Optional. If using real photos, keep them 48×48 or larger with square crop. |
| OG / social image | `https://dogdadboarding.com/og-image.jpg` | Real 1200×630 Open Graph image | Must be hosted at that exact path or update `og:image`, `twitter:image` (add if desired), and structured data `image` in `index.html`. |

## Forms

| Item | Current value | Required action |
|------|---------------|-----------------|
| Contact form action | `https://submit-form.com/YOUR_FORM_ID` | Replace `YOUR_FORM_ID` with your actual form endpoint ID (e.g. Formspark, Tally, Basin, etc.). |
| Newsletter form action | `https://submit-form.com/YOUR_FORM_ID` | Replace in `script.js` (line ~610 at time of writing) with your real newsletter endpoint. If endpoint changes domain, update the CSP `connect-src` / `form-action` in `index.html`. |

## URLs / Identifiers

| Item | Current value | Required action |
|------|---------------|-----------------|
| Google review CTA | `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID` | Replace `YOUR_PLACE_ID` with your real Google Business Profile Place ID. |
| Hero trust badges | `Max 8 / 24/7 / 7` placeholders | Swap in real stats when known (e.g. dogs cared for, star rating). If you add a rating, also add back an honest `aggregateRating` block to the JSON-LD — never ship placeholder review counts there (Google penalizes fabricated ratings). |
| Social links | `https://instagram.com/dogdadboarding`, `https://facebook.com/dogdadboarding`, `https://tiktok.com/@dogdadboarding` | Verify or replace with your real social URLs. Also update `sameAs` in the LocalBusiness structured data. |
| Blog posts to write | `/blog/preparing-dog-boarding-stay`, `/blog/seasonal-pet-care-austin`, `/blog/puppy-socialization-tips` | Resource cards are non-link teasers for now, so nothing 404s. Write these posts at any point, then re-link the cards. |

## Fonts

- Fonts are currently loaded from `https://fonts.bunny.net`. For better privacy/performance, consider self-hosting `Fraunces` and `Nunito Sans` and updating the `@font-face` rules in `styles.css`.

## Analytics / Tracking

- No analytics script is installed yet. If you add Google Analytics, Plausible, Fathom, etc., update the CSP `script-src` accordingly (and remove `'unsafe-inline'` from `style-src` if you no longer need it for Leaflet dynamic styles).

## Security / CSP

- Once `style-src 'unsafe-inline'` can be removed (e.g. Leaflet no longer needed or self-hosted with hashed styles), tighten the CSP further.
- If you move the contact/newsletter endpoints to a different domain, update `connect-src` and `form-action` in `index.html`.

## Deployment

- Ensure `sitemap.xml` and `robots.txt` are copied to the production root.
- Ensure `og-image.jpg` is created and uploaded.
- Remove any local `.DS_Store` files from the deploy bundle.
