# Digital Universe Pro Landing Page

An accessible React website for Digital Universe Pro’s Amazon growth and AI services.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- Lucide React

The website uses JavaScript/JSX with typed content models. TypeScript 6.0.x and typescript-eslint 8.70.x provide compatible type-checking and lint tooling. Framer Motion and its unused legacy components have been removed.

## Run Locally

```bash
nvm use
npm ci
npm run dev
```

Use Node.js 22 (at least 22.12; `.nvmrc` selects the current 22.x patch). Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Verification

```bash
npm run check
```

This runs lint, typed-content checks, all unit/integration/architecture tests, a production build, SEO output verification, and deployment configuration/artifact checks. `npm run security:check` checks the locked dependencies against npm advisories. GitHub Actions runs these checks and the browser suites on pushes and pull requests. Individual commands remain available: `lint`, `type-check`, `test`, `build`, and `seo:verify`.

For browser checks, start `npm run preview` in another terminal, then run:

```bash
npm run integration:verify
npm run responsive:verify
npm run hero:verify
npm run coverage:verify
npm run ai:verify
npm run calculator:verify
```

The audits use `http://127.0.0.1:4173/` by default. Set `AUDIT_BASE_URL` or `CHROME_PATH` when needed. Generated map screenshots go to `artifacts/audits/`. Integration checks simulate lead delivery rather than contacting a CRM.


## Project Structure

```text
api/                    # HTTP endpoint adapter
server/leads/           # Server-only lead delivery
shared/                 # Browser/server validation contract
build/                  # Vite SEO plugin
public/                 # Files copied unchanged
src/
  index.html            # Homepage HTML entry
  <route>/index.html    # Route HTML entries, including nested case studies
  404.html              # Error page entry
  main.jsx              # React bootstrap
  app/                  # Route selection and page loading
  pages/                # Home, services, about, contact, case studies, legal
  components/           # Shared layout, UI, and case-study presentation
  features/             # Lead capture, AI enquiries, global coverage, ROI calculator
  analytics/            # Consent, event tracking, provider adapters
  experiments/          # Controlled conversion experiments
  content/              # Typed content and supplied legal wording
  config/               # Site identity, routes, navigation, SEO
  assets/               # Imported production images
  styles/               # CSS and shared layout classes
  types/                # Asset declarations
scripts/audits/          # Browser and production-output checks
scripts/lib/            # Shared browser-audit helpers
tests/                  # Unit, integration, and architecture checks
docs/                   # Current guides, archived plans, reference originals
```

Vite uses `src/` as its root. Environment files, tool configuration, `public/`, and `dist/` remain at the project root. Public URLs are unchanged. See [architecture and ownership rules](docs/architecture.md) for dependency boundaries, asset policy, and an old-to-new path guide.

`dist/`, `node_modules/`, and `artifacts/` are ignored generated/local directories. The old release ZIP is preserved at `artifacts/legacy/dist.zip`; current releases come from `npm run build`. Original JPEGs are retained under `docs/reference-assets/`.

## Homepage Flow

Defined in `src/pages/home/HomePage.jsx`:

1. Sticky header, including a link to the separate AI Services page
2. Recorded four-message typewriter hero and audit form (USD / INR / GBP; no Amazon URL field)
3. Official Amazon SPN trust bar
4. Region-separated selected client brands
5. Founder-reported performance figures
6. Six concise Amazon service cards
7. Two featured sales snapshots, three more in an expandable gallery
8. Growth calculator, loaded as it approaches the viewport
9. Four-step process
10. Founder introduction
11. Three client testimonials with expandable full quotes
12. Interactive marketplace explorer and regional partner links
13. Eight-question Amazon FAQ
14. Amazon growth audit closing panel
15. Footer

AI services now live at `/ai-services`, with all six capabilities and their existing project enquiry links. Old `/#ai-*` links forward to the new page. `/amazon-spn` presents the four founder-supplied India listings and is the destination of “Explore Our SPN Page”.

See [the interactive map](docs/interactive-marketplace-map.md) and [UI refresh verification](docs/ui-refresh-implementation.md) for the September 2026 changes and deferred launch configuration.

The [AI services and yellow theme update](docs/ai-services-and-yellow-theme.md) documents the six new services, responsive card layout, project enquiry path and shared brand palette.

The [growth calculator guide](docs/growth-calculator.md) explains the editable additional-revenue multiplier, correct period totals, currencies, validation and browser checks. The calculator opens at `/#growth-calculator` and appears without a separate expand button.

The [recording-inspired hero and map update](docs/hero-map-recording-update.md) describes the slower typewriter messages, continuous map motion, map pause controls and motion preferences.

The [homepage design refinement](docs/homepage-design-refinement.md) records the updated section sequence, design references, visual system and launch-readiness limits.

## Centralized Site Configuration

All brand/contact/social/legal settings are centralized in:

- `src/config/site.js`

Update this file to change:

- Brand name
- Support email
- Phone display/E.164 number
- WhatsApp number and default message
- Social profile URLs
- Legal links

Business metrics and non-metric credentials are inventoried in:

- `src/content/businessMetrics.ts`

`FOUNDER_PERFORMANCE` holds the figures explicitly supplied and authorized for marketing by the business on 25 September 2026. They are visibly attributed to the founder, with dollars used for revenue and ad spend. They are separate from the older `BUSINESS_METRICS` evidence inventory and are not represented as independently verified results. The reporting period and success-rate definition remain unspecified.

## Form Behavior

- `src/features/lead-capture/AuditForm.jsx` is the one canonical free-audit form, reused on the home and contact pages. `useAuditForm.js` owns its state, validation, focus, and submission flow.
- The four requested lead fields are validated in the browser and again by `api/leads.js` through `server/leads/leadSubmission.js`, using the common `shared/leadSchema.js` contract.
- The browser submits JSON with `POST`; lead values are never placed in a URL.
- Delivery is intentionally unconfigured until `LEAD_WEBHOOK_URL` points to an approved HTTPS CRM/webhook destination.
- The UI shows success only after the destination acknowledges delivery. Missing configuration, network errors, and upstream failures remain visible failures.
- See `docs/lead-funnel.md` and `.env.example` for the integration contract and manual testing flow.

Homepage header, hero and service CTAs call the shared action in `src/features/lead-capture/primaryCta.js`. The action scrolls to the primary hero form, respects reduced-motion preferences, and focuses the first field. The final enquiry section links directly to `/contact#primary-audit-form`; the contact page focuses that form on arrival.

AI service CTAs use `/contact?service=<service-id>#ai-project`. The requested service is captured before analytics cleans URL queries, validated against `src/content/aiServices.ts`, and selected in the dedicated AI enquiry area. WhatsApp and email links include that selection in an editable message. These links do not submit through the Amazon audit API or require Amazon account details.

## Legal Routes

The production build generates static entries for:

- `/privacy-policy`
- `/terms-of-service`
- `/cookie-policy`

The Privacy Policy displays the wording supplied by the business. The Terms of Service route displays
the supplied 28-section draft in the same legal-page layout, together with the business and legal
details still required before it can take effect. The Cookie Policy remains an unpublished notice.
Legal routes are marked `noindex, nofollow` until their publication status and final wording are approved.

## Case-study Routes

The production build also generates static entries for:

- `/case-studies`
- `/case-studies/template`

No complete client case study is currently published. `/case-studies` presents the same supplied sales-snapshot gallery as the homepage. It and the internal template remain `noindex, nofollow`. A screenshot with an unresolved date range is excluded from the gallery; originals are retained. See `docs/case-study-evidence.md` before publishing a complete attributed study.

## Service and Commercial Content

The six service categories, four-step delivery process, engagement-term placeholders, and FAQs are centralized in:

- `src/content/serviceContent.ts`

Commercial values remain unpublished until approved. See `docs/service-commercial-inputs.md` for the pricing, contract, onboarding, reporting, access, security, ownership, marketplace, and measurement decisions still required.

## Deployment Notes

- **Founder review: Vercel.** Import the repository with its root directory unchanged. `vercel.json` defines Node API handling, build/output settings, explicit page rewrites, and noindex headers for Vercel review domains.
- **Production: GoDaddy cPanel/Apache.** Upload the contents of `dist/`, including `.htaccess`, to the domain document root. The build uses root-relative asset URLs.
- GoDaddy static hosting does not execute `api/leads.js`. Keep the API on Vercel and build the GoDaddy frontend with `VITE_LEAD_API_URL` pointing to its stable HTTPS endpoint. Configure the actual CRM/webhook separately.
- The obsolete GitHub Pages deployment command/package has been removed.
- Follow the [deployment runbook](docs/deployment.md). See the [release audit](docs/production-readiness.md) for results and remaining launch inputs.

## Technical SEO

- Canonical origin: `https://digitaluniversepro.co`
- Route metadata and schema: `src/config/seo.js`
- HTML metadata and static-output generation: `build/seoPlugin.js`
- Apache redirects: `public/.htaccess`
- Build artifact check: `npm run seo:verify`
- Deployment checklist: `docs/technical-seo.md`

## Conversion analytics

- Consent-gated abstraction: `src/analytics/`
- Consent interface: `src/analytics/AnalyticsConsentBanner.jsx`
- Provider identifiers: `.env.example`
- Event taxonomy, privacy rules, calendar callback, and funnel: `docs/analytics-events.md`

No analytics provider script loads until analytics consent is granted. With all provider environment variables blank, the preference interface stays hidden and no provider event is transmitted; sanitized development logging can still be used to inspect instrumentation locally.

## Controlled CRO experiments

- Dormant experiment catalogue and feature flags: `src/experiments/`
- Baseline, hypotheses, primary metrics, guardrails and decision rules:
  `docs/cro-experiments.md`
- Production assignment requires explicit approval and exactly one active experiment ID.
- Assignment is session-stable; internal, automated and preview traffic is excluded from
  experiment analytics context.
- No experiment is active by default, and the case-study-proof treatment is blocked until
  verified publishable evidence exists.

## Accessibility, responsive design, and performance

- All full page layouts include a skip link and named `main` target.
- The canonical form uses persistent labels, announced status/error content, and mobile keyboard hints.
- FAQ controls expose `aria-expanded`, `aria-controls`, and labelled answer regions.
- Below-the-fold founder imagery uses local responsive WebP assets with fixed dimensions and lazy loading.
- The active stylesheet uses the local system font stack and honours reduced-motion preferences.
- `npm run responsive:verify` checks 360, 390, 768, 1024, 1366, and 1440 px viewports in headless Chrome against the production preview at `http://127.0.0.1:4173/`.
- Audit results and Lighthouse commands are recorded in `docs/accessibility-performance.md`.
