# FGFC Markets Global Ltd — Corporate Website

Single-page corporate site for **FGFC Markets Global Ltd**, an investment firm
licensed and regulated by the Financial Services Commission (FSC) of Mauritius as
an Investment Dealer (licence GB25205302). Modelled on the Vie Finance Sey /
Securcap MU disclosure-site pattern and built to the approved copy deck
(`FGFC-Markets-Global-Content.md`), as amended by the legal review of
September 2026 (`FGFC_Website Review.docx`).

> **Copy is legally reviewed — do not edit site copy casually.** This is the site
> of a regulated investment firm: content must stay factual, balanced and capable
> of being substantiated. State facts, not promises. Avoid claims about safety,
> protection, performance, reliability, trust or client outcomes. Present
> regulatory status factually, never as a marketing claim, and never state what
> the FSC guarantees, ensures or protects. Use *Investment Firm* /
> *Investment Dealer* — never *broker* or *brokerage*.

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

Company data confirmed at legal review is now hard-coded in the copy. Only the
values below remain unconfirmed; each is still rendered as a gold `[BRACKETED]`
token (`.tok` span) so it cannot be missed. **Search `src/` for `[` to find them:**

| Token | Where | Needed from |
| --- | --- | --- |
| `[PHONE NUMBER]` | Reach Us → Registered Office | The number to be published |
| `[COMPANY REGISTRATION NUMBER]` | Terms of Use, opening paragraph | Registrar of Companies number |
| `[DATE]` | Legal pages (“last updated”) | Set when counsel signs off each page |

Confirmed and applied: company name and status (Investment Dealer, FSC Mauritius,
licence `GB25205302`), incorporation year 2025, registered address (Premier
Business Centre, 10th Floor, Sterling Tower, 14 Poudriere Street, Port Louis,
Mauritius), brand name (Jim, Ben & Conners), asset classes (Commodities,
Currencies, ETFs, Indices, Stocks), email domain `fgfc-markets.com`, copyright
year 2026.

### Open questions for the client

- **Email addresses.** `[DOMAIN]` was resolved to `fgfc-markets.com` from the
  `info@fgfc-markets.com` address supplied in the review. Confirm that
  `support@`, `operations@`, `compliance@` and `recruitment@` are live mailboxes —
  `compliance@fgfc-markets.com` is the stated contact point on all four legal
  pages, so it must resolve. If only `info@` exists, the role addresses in
  `ReachUs.astro` and the legal pages need to change.
- **Copyright year** is hard-coded to 2026 as instructed; it needs an annual
  update (or say the word and it can be generated at build time).

## Pre-launch checklist

- [ ] Replace the four remaining bracketed tokens above (the `.tok` spans disappear once brackets are gone from copy)
- [ ] Wire the contact form to a real endpoint (`src/scripts/main.js`, section 7 — currently a client-side demo; the success panel says so)
- [ ] Set the production domain: `site` in `astro.config.mjs`, absolute `og:` URLs in `src/layouts/Base.astro`, `Sitemap:` line in `public/robots.txt`
- [ ] Legal pages are **draft templates** (each carries a “pending legal review” chip) — have counsel review Privacy / Terms / Cookies / Risk Disclosure
- [ ] Confirm the role-based email addresses resolve (see open questions above)
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
