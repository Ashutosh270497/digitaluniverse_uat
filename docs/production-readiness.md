# Release readiness — 25 September 2026

**Ready to push and deploy to Vercel for founder review.** The application has
passed local release checks. A live Vercel deployment has not been performed or
verified in this audit. Public GoDaddy launch still requires the owner inputs
listed below.

## Changes made during the release audit

- Updated compatible dependencies and the lockfile: npm's audit went from 15
  findings (10 high, 3 moderate, 2 low) to zero. Installed build tools include
  Vite 7.3.6, PostCSS 8.5.28, and Rollup 4.63.5.
- Added Vercel build settings, explicit page rewrites, canonical redirects,
  noindex headers for Vercel review domains, and the lead-function time limit.
- Standardized on Node 22.x and a clean lockfile installation. Added GitHub
  Actions for lint, types, tests, production build, dependency audit, deployment
  verification, and all five browser suites. The workflow has not run on GitHub
  yet; its commands were exercised locally.
- Removed the unused GitHub Pages deployment package and scripts.
- Changed assets to domain-root URLs so nested error pages load their CSS/JS.
- Added Apache security/cache headers and text compression, including both
  JavaScript MIME types used by Apache installations.
- Hardened lead delivery: UTF-8 byte limits, JSON object validation, exact JSON
  content types, HTTPS origin checks, no-store responses, redirect rejection,
  browser timeout, and controlled errors for Vercel's lazy JSON parser.
- Added regression coverage for these request and deployment failure cases.
- Corrected stale deployment paths in the documentation and documented the
  Vercel-to-GoDaddy sequence in [deployment.md](deployment.md).

## Verification results

| Check | Result |
| --- | --- |
| Clean install using `npm ci` | Passed |
| ESLint and TypeScript | Passed |
| Unit, integration and architecture tests | 131 passed, 0 failed |
| Production build | Passed |
| Static SEO metadata | All 14 HTML entries passed |
| Deployment artifact and routing checks | Passed |
| Vercel configuration | Validated against the official configuration schema |
| `npm run security:check` | Zero reported vulnerabilities |
| Full browser route/form/link audit | Passed; delivery simulated, no live CRM POST |
| Responsive layout audit | Passed at 320, 360, 390, 768, 1024, 1366, 1440 px |
| Map, AI enquiry, calculator browser suites | Passed |
| Local Apache HTTPS test of the built artifact | Page metadata, alias/host/HTTPS redirects, real nested 404s, assets, headers, gzip and cache policies passed |
| Mobile Lighthouse on localhost | Performance 98; accessibility 100; best practices 100; SEO 100 |
| Lighthouse timing | LCP 2.4 s; TBT 0 ms; CLS 0 |
| Working-tree hygiene | No conflict markers or matches in the targeted credential-pattern scan; no real environment/key files or files over 5 MB in the proposed source tree |

Audit logs and Lighthouse JSON are in ignored `artifacts/audits/production-*`
files and `artifacts/audits/lighthouse-production-mobile.json`. Local Apache
tested an unchanged copy of the built `.htaccess` on a temporary HTTPS server.
These results do not measure Vercel/GoDaddy network latency, account settings,
deployment protection, real browser-device combinations, or actual CRM delivery.

## Owner inputs and launch checks still outstanding

1. **Lead destination:** set an approved HTTPS webhook/CRM destination in Vercel
   and confirm receipt of an authorized test enquiry. Without it, the audit
   form correctly returns a delivery error; WhatsApp/email enquiry links remain
   available. AI enquiries use their dedicated WhatsApp/email path.
2. **GoDaddy API connection:** build with the stable Vercel API URL and verify
   the public endpoint and GoDaddy-origin CORS. The frontend ZIP/upload alone
   cannot run the Node API.
3. **Business and policy details:** finalize the business identity/address and
   policy text. The legal routes still show their existing incomplete/draft
   state and remain noindex; they have not been represented as approved.
4. **Live deployment checks:** verify routing, HTTPS, headers, forms, caching,
   and mobile behavior on the actual host using [deployment.md](deployment.md).

Founder performance figures remain attributed as supplied. No reporting period
or definition for the reported success rate has been invented. Case studies
still require evidence before publication. No repository push, deployment, DNS
change, or live lead submission was performed during this audit.

## Recording follow-up — 26 September 2026

The hero now uses the supplied four-message typewriter sequence. The existing
map now loops its connection animation and marker pulses with pause controls.
The production check still passes all 131 tests, 14 SEO entries and deployment
checks. New hero motion tests, extended map motion tests, responsive checks and
route/form integration checks passed. See [the recording update](hero-map-recording-update.md).
The deployment and owner-input requirements above still apply.

After this update, mobile Lighthouse scored 97 performance and 100 for
accessibility, best practices and SEO (LCP 2.4 s, TBT 0 ms, CLS 0). This is a
local preview measurement; the report is `artifacts/audits/lighthouse-recording-mobile.json`.

### Hero readability adjustment

At the owner’s request, the hero pause button was removed. Completed headlines
now remain visible for five seconds, with slower typing/deletion. Reduced-motion
and offscreen/hidden-tab handling remain. The map and its controls are unchanged.
Validated after this adjustment: 131 tests and the production build passed; the
hero browser audit passed at 320, 390, 768, 1024 and 1440 px, including reading
time, no layout jumps, reduced motion and absence of the button.
