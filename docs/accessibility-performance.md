# Accessibility, responsive design, and performance baseline

Historical baseline: this document describes the August build. See [the September UI refresh report](ui-refresh-implementation.md) for current checks; do not use the scores below as measurements of the refreshed site.

Audit date: 2026-08-26\
Audit target: local Vite production preview at `http://127.0.0.1:4173/`\
Browser engine: installed Google Chrome, controlled headlessly\
Lighthouse: 12.8.2

These are repeatable lab measurements from the local production build. They are not Chrome UX Report field data and can vary with hardware, browser version, and hosting response times.

## Implemented changes

- Added a keyboard-visible skip link and stable `#main-content` target to full page layouts.
- Added a consistent visible focus fallback while preserving component-specific focus rings.
- Replaced the FAQ disclosure implementation with labelled buttons that expose `aria-expanded`, `aria-controls`, and answer regions.
- Kept permanent form labels and error associations, and added mobile keyboard hints for name, email/WhatsApp, and Amazon URL inputs.
- Kept the primary audit CTA visible in the sticky header at mobile widths and added Escape-key handling to the mobile menu.
- Removed the render-blocking Google Fonts import and moved the active design to a local system font stack.
- Replaced the 216.7 KB founder JPEG with 27.9 KB and 60.4 KB responsive WebP variants, fixed intrinsic dimensions, `sizes`, lazy loading, and async decoding.
- Removed the unused 872 KB `public/expert-photo.jpg` asset from the deployed output. The tracked source remains recoverable from Git.
- Added required image dimensions to the case-study asset model for future approved evidence assets.
- Split legal, case-study, marketing, and not-found route components into on-demand JavaScript chunks.
- Kept duplicate logo carousels and motion-heavy legacy components out of the active homepage render tree.
- Updated the legacy thank-you page with visible focus styles, reduced-motion support, accessible decoration, and working phone/email actions.

## Responsive verification

Run the production preview first, then execute:

```bash
npm run build
npm run preview -- --host 127.0.0.1
npm run responsive:verify
```

The automated Chrome audit passed at 360, 390, 768, 1024, and 1440 px. At every width it confirmed:

- document width equals viewport width;
- no visible element extends outside the viewport;
- no visible focusable control lacks an accessible name;
- no user-facing form field lacks a label;
- the sticky primary audit CTA is visible and inside the viewport;
- all ten FAQ controls have valid expanded state and answer-panel relationships;
- email, phone, and WhatsApp actions are present;
- header, navigation, main, section, and footer landmarks are present.

Reduced-motion emulation matched successfully and changed root smooth scrolling to `auto`.

## Lighthouse results

Homepage mobile:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Mobile metrics: FCP 1.4 s, LCP 1.7 s, TBT 0 ms, CLS 0, Speed Index 1.6 s.

Homepage desktop:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Desktop metrics: FCP 0.3 s, LCP 0.4 s, TBT 0 ms, CLS 0, Speed Index 0.3 s.

Contact page mobile:

| Category | Score |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Contact metrics: FCP 1.4 s, LCP 1.8 s, TBT 0 ms, CLS 0.

Commands used:

```bash
npx --yes lighthouse http://127.0.0.1:4173/ --output=json --output-path=/tmp/dup-lighthouse-mobile.json --quiet --chrome-path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --chrome-flags='--headless=new --no-sandbox'
npx --yes lighthouse http://127.0.0.1:4173/ --preset=desktop --output=json --output-path=/tmp/dup-lighthouse-desktop.json --quiet --chrome-path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --chrome-flags='--headless=new --no-sandbox'
npx --yes lighthouse http://127.0.0.1:4173/contact --output=json --output-path=/tmp/dup-lighthouse-contact-mobile.json --quiet --chrome-path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --chrome-flags='--headless=new --no-sandbox'
```

## Build-size comparison

| Artifact | Before | After |
| --- | ---: | ---: |
| Total `dist` directory | 1.5 MB | 592 KB |
| Homepage JavaScript | 327.6 KB / 91.9 KB gzip | 293.5 KB / 86.6 KB gzip |
| Founder image shipped on active pages | 216.7 KB JPEG | 27.9/60.4 KB WebP variants |
| Unused public portrait copied to build | 872 KB | Removed |

## Remaining opportunities

- Lighthouse reports about 31 KiB of unused homepage JavaScript. Most of the remaining script supports the full long-form homepage and its interactive form/FAQ; deferring search-visible section content until intersection could improve this number but would add rendering and SEO trade-offs.
- The homepage contains 1,139 DOM elements, driven mainly by complete service details kept in collapsed disclosures. Rendering scope details only after expansion could reduce DOM size, but the content would no longer be immediately available without interaction.
- Mobile Lighthouse identifies the single generated CSS file as render-blocking, with an estimated 150 ms saving. At 8.7 KB transferred it does not currently harm the score; critical-CSS extraction would add build complexity.
- Lighthouse on localhost does not measure production server latency, compression configuration, CDN caching, or real-user Core Web Vitals. Re-run after deployment.

## Manual checks after deployment

- Navigate the whole header, audit form, service disclosures, FAQ, social links, and footer using only Tab, Shift+Tab, Enter, Space, and Escape.
- Submit the form with empty values and with a simulated server failure while VoiceOver or NVDA is running; confirm the status message and focused field error are announced.
- Use iOS Safari and Android Chrome to confirm the email, telephone, URL, and WhatsApp keyboards/actions.
- Check 200% browser zoom and large text on a physical phone.
- Verify the published server sends Brotli or gzip compression and long-lived immutable caching for hashed assets.
- Run Lighthouse against the canonical HTTPS production URL from a clean browser profile.
