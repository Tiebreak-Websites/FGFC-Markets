# FGFC Markets Global Ltd — Corporate Website

Single-page corporate site for **FGFC Markets Global Ltd**, a licensed brokerage
firm, modelled on the Vie Finance Sey / Securcap MU disclosure-site pattern and
built to the approved copy deck (`FGFC-Markets-Global-Content.md`).

**Design concept — “The Ledger”:** private-bank restraint with an
engraved-document motif. Deep navy canvas, antique-gold hairlines, an ivory
“paper” band, clause-numbered oversight list, a rotating guilloché seal, and a
paper intake-form card. Typography: Cormorant Garamond (display), Lora (body),
Marcellus (caps/labels), IBM Plex Mono (data tokens).

## Stack

- [Astro 5](https://astro.build) — static output, zero client framework
- Vanilla CSS (`src/styles/global.css`) — no CSS framework
- Vanilla JS (`src/scripts/main.js`, ~6 KB bundled) — scroll reveals, scrollspy,
  canvas “market pulse”, parallax, mobile menu, form validation, hero-video gating
- Self-hosted fonts via Fontsource (no CDN requests)
- Imagery + hero video generated with Higgsfield (Nano Banana Pro / Seedance 2.5),
  optimized to WebP/JPEG with `sharp`

## Commands

```bash
npm install     # install dependencies
npm run dev     # dev server on http://localhost:4321
npm run build   # production build to ./dist
npm run preview # serve the production build
```

Utility scripts (dev-only):

```bash
node scripts/optimize-images.mjs <src-dir>   # regenerate public/assets from raw renders
node scripts/qa.mjs <out-dir> [baseUrl]      # headless QA: screenshots + audits
node scripts/qa-sections.mjs <out-dir>       # per-section screenshots
```

## ⚠ Pending data — replace before launch

The approved copy deck deliberately leaves company data unconfirmed. Every
pending value is rendered as a gold `[BRACKETED]` token (`.tok` spans) so it is
impossible to miss in review. **Search the `src/` folder for `[` and replace:**

| Token | Where |
| --- | --- |
| `[YEAR]` | Hero, footer copyright |
| `[JURISDICTION]` | Hero, Oversight §1, footer, legal pages |
| `[REGULATOR FULL NAME]` / `[REGULATOR ABBREVIATION]` | Hero, Who We Are, Oversight §1, footer, privacy |
| `[LICENSE NUMBER]` | Hero, Who We Are, Oversight §1, footer |
| `[LICENSE TYPE]` | Who We Are, footer, risk disclosure |
| `[LEGISLATIVE REFERENCE]` | Who We Are |
| `[ASSET CLASSES]` | Who We Are, What We Offer |
| `[BRAND NAME]` | Who We Are (optional paragraph) |
| `[COMPANY REGISTRATION NUMBER]` | Oversight §1, Terms |
| `[APPLICABLE REGULATORY FRAMEWORK]` | Oversight §2, legal pages |
| `[INVESTOR COMPENSATION / GUARANTEE FUND NAME]` | Oversight §4, risk disclosure |
| `[HEADQUARTERS COUNTRY]` / `[LIST OF COUNTRIES]` | Oversight §5 |
| `[X YEARS]` / `[REGIONS SERVED]` | What We Offer |
| `[FULL REGISTERED ADDRESS]` | Reach Us, footer, legal pages |
| `[PHONE NUMBER]` / `[FAX NUMBER]` | Reach Us |
| `[DOMAIN]` | Reach Us emails, legal pages |
| `[DATE]` | Legal pages (“last updated”) |

## Pre-launch checklist

- [ ] Replace all bracketed tokens above (then delete the `.tok` styling or keep it — the spans disappear once brackets are gone from copy)
- [ ] Wire the contact form to a real endpoint (`src/scripts/main.js`, section 7 — currently a client-side demo; the success panel says so)
- [ ] Set the production domain: `site` in `astro.config.mjs`, absolute `og:` URLs in `src/layouts/Base.astro`, `Sitemap:` line in `public/robots.txt`
- [ ] Legal pages are **draft templates** (each carries a “pending legal review” chip) — have counsel review Privacy / Terms / Cookies / Risk Disclosure
- [ ] Confirm the optional paragraphs kept from the deck (brand name, compensation fund) or remove them
- [ ] Consider a consent banner only if analytics are added (Cookie Notice already covers this)

## Structure

```
src/
  layouts/    Base.astro (head/meta/fonts), Legal.astro
  components/ Header, Rail, Hero, Ticker, WhoWeAre, Oversight, Offer,
              ReachUs, Footer, Seal (guilloché), Mark (logo mark)
  pages/      index, privacy, terms, cookies, risk-disclosure
  styles/     global.css (design system)
  scripts/    main.js (all interactions)
  lib/        tokens.mjs (renders [PENDING] copy tokens)
public/
  assets/     logos, imagery (WebP/JPEG), hero-loop.mp4, og.jpg
```

## Accessibility & performance notes

- Semantic landmarks, skip-link, single `h1`, labelled nav/rail, `aria-expanded`
  menu, focus-visible styles, honeypot instead of CAPTCHA
- `prefers-reduced-motion` disables reveals, canvas, ticker, seal rotation and
  the hero video (static poster remains)
- Hero video (1.2 MB) loads only on ≥900 px viewports without Save-Data;
  images are lazy-loaded WebP; JS bundle ≈ 2.5 KB gzipped; no external requests
