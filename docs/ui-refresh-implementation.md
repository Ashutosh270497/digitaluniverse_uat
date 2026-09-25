# UI refresh — 25 September 2026

Subsequent update: the optional WebGL map described below was replaced by the [interactive marketplace explorer](interactive-marketplace-map.md). This report records the earlier UI refresh.

Implementation of [the approved UI audit](ui-audit-2026-09-25.md), including the founder's performance figures and subsequent clarification that monetary amounts are in dollars. Changes are local; nothing has been deployed.

## What changed

- Replaced the rotating hero with a stable service proposition, a white audit form, a gold submit button and a useful secondary service link. Retained validation, consent links, analytics hooks and real acknowledgement requirements.
- Consolidated the homepage into a focused sequence. Removed duplicate logo displays, repeated conversion sections, empty case-study panels and unfinished commercial cards from the render tree.
- Added a compact, expandable USA/UK/India SPN directory with all nine supplied destinations; retained the Amazon Ads directory link. Client logos have one selected row and an expandable full collection.
- Added founder-reported performance: $10M+ revenue, 500+ sellers, $5M+ ad spend, 1M+ units, 30+ categories, five years' experience and a 95% reported success rate.
- Simplified six service cards, the four-step process, founder introduction, testimonials, FAQ and final enquiry section. The final action links directly to the contact form. Updated related service, About, Contact and results pages.
- Published two featured sales screenshots and three additional examples behind a disclosure. Lossless WebP crops preserve the source pixels; originals are unchanged and available from the accessible enlarge dialog. One source screenshot with an ambiguous date range remains unpublished.
- Made the scenario calculator optional and lazy-loaded. Added numeric entry alongside sliders, with editing allowed before values are bounded on blur.
- Reduced the coverage map and used Europe, North America and Asia as regional support labels. Static rendering is the default; WebGL downloads only when the visitor requests it. Graphics capability detection is deferred until the section approaches the viewport. Reduced-motion and off-screen suspension remain supported.
- Standardized content widths, spacing, button treatments and darker amber text on light surfaces. Added anchor clearance for the sticky header; kept mobile inputs at a readable size and shortened the mobile header action.

## Performance claim provenance

`src/content/businessMetrics.ts` contains a separate `FOUNDER_PERFORMANCE` record. These figures are authorized business-supplied marketing claims, visibly attributed to the founder. They are not marked as audited case-study outcomes, annual revenue, client guarantees or a count of countries.

The reporting period and the definition/denominator of the 95% success rate were not supplied. Keep these unknowns in the internal record; obtain the definition before making more specific success claims. The context supplied by the user describes agency performance; no independently verified agency-versus-career breakdown is available.

The region labels describe Amazon support across multiple countries. They do not assert offices, shipping routes or service in every country of those regions. Existing testimonial provenance and case-study publication checks remain in place.

## Verification

The local production preview is the test target. No enquiry was delivered to a live CRM or inbox during these checks.

- `npm run check`: lint, TypeScript, 107 tests, production build and metadata/schema verification for 14 HTML entries.
- `npm run integration:verify`: route rendering, internal links, pointer/keyboard enquiry actions, mobile navigation, FAQ, validation, simulated successful/failed lead delivery, attribution and analytics consent behavior.
- `npm run responsive:verify`: 320, 360, 390, 768, 1024, 1366 and 1440 px; overflow, labels, image loading, IDs, credentials, founder figures, expanded disclosures, screenshot-dialog focus/Escape, optional calculator and reduced motion.
- `npm run coverage:verify`: desktop, mobile, reduced motion and forced WebGL fallback; no graphics context at startup, no WebGL download before explicit interaction, marker keyboard access, restoring the static map and off-screen animation suspension.

Fresh Lighthouse measurements and screenshots are saved in `artifacts/audits/`. The August scores in `accessibility-performance.md` are historical and do not describe this build. Automated checks do not substitute for real iOS/Android testing, a full manual accessibility audit or deployed-host measurements.

Lighthouse 12.8.2, local production preview in headless Chrome on 25 September 2026:

| View | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 98 | 100 | 100 | 100 | 2.2 s | 0 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0 |

These are lab results, not field performance or a guarantee of deployed scores. The first mobile pass identified startup graphics probing; deferring that work removed the measured blocking time. The remaining image-sizing advisory concerns small client logos and is not a broken-image error.

## Deferred launch setup

The user will supply the hosting platform, lead destination and final business/legal details later. These are still needed to complete launch:

1. Configure and deploy the lead API and destination; verify one actual enquiry arrives once in the intended CRM or inbox. Static hosting alone does not execute `api/leads.js`.
2. Confirm the legal business name/address and finalized policy wording. Existing legal draft routes remain excluded from indexing; they have not been represented as finalized terms.
3. Verify deployment redirects, direct route responses, 404 status, social previews and any approved analytics configuration on the chosen host.

The optional WebGL chunk still triggers Vite's size advisory (about 926 KB minified / 252 KB gzip); it is excluded from initial page loading and requested only by the enhanced-map action.

## Review and rollback

Desktop and mobile previews: `artifacts/audits/ui-refresh-full-1440.png` and `artifacts/audits/ui-refresh-full-390.png`. Focused hero previews are saved alongside them.

The workspace state before this UI refresh was preserved at `artifacts/checkpoints/pre-ui-refresh/workspace.tar.gz`. Generated assets, dependencies and Git metadata are excluded from that archive. Existing uncommitted work was retained; no commit or deployment was made.
