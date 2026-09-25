# Codebase architecture

This repository contains one React/Vite website and a small lead-delivery API. It does not require a monorepo or a separate package for each feature.

## Directory ownership

| Directory | Responsibility |
| --- | --- |
| `src/app/` | Select the page for a URL and apply runtime route metadata. |
| `src/pages/` | Route-level components. Homepage-only sections live in `pages/home/sections/`. |
| `src/components/layout/` | Shared page layouts, headers, and footer. |
| `src/components/ui/` | Reusable presentation elements such as breadcrumbs and lists. |
| `src/components/case-studies/` | Case-study presentation reused by multiple pages. |
| `src/features/lead-capture/` | Audit form, state hook, browser submission client, CTA behavior, consent, and public configuration. |
| `src/features/ai-services/` | AI illustration, card styles, project selection and contextual WhatsApp/email enquiries. |
| `src/features/global-coverage/` | Lazy vector map, region selection, directory panel, bounded pan/zoom and guided tour. |
| `src/features/roi-calculator/` | Growth calculator inputs, result cards, currency formatting and validated scenario arithmetic. |
| `src/content/` | Typed business content, proof records, service copy, and publication gates. |
| `src/content/legal/` | Supplied legal wording and missing-publication-input lists. JSX preserves the existing policy markup. |
| `src/config/` | Site identity, routes, navigation, and SEO metadata. |
| `src/analytics/`, `src/experiments/` | Existing consent-aware analytics and controlled experiments. |
| `src/assets/` | Images imported by the application and processed by Vite. |
| `src/styles/`, `src/types/` | Global CSS, shared layout classes, and asset declarations. |
| `shared/` | Environment-independent contracts consumed by browser and server. |
| `server/` | Server-only lead validation policy, rate limits, and webhook delivery. |
| `api/` | Deployment adapter exposing the server handler. |
| `build/` | Vite SEO plugin: static search shell, head tags, brand image, sitemap, and robots output. |
| `public/` | Files copied unchanged, including Apache rules and the legacy thank-you URL. |
| `scripts/audits/`, `scripts/lib/` | Executable audits and their shared Chrome/CDP helpers. |
| `tests/unit/` | Validation, calculations, routing, analytics, and experiment behavior. |
| `tests/integration/` | Lead-delivery behavior and conversion/form wiring. |
| `tests/architecture/` | Source boundaries, semantic structure, content contracts, and SEO entry checks. |
| `docs/archive/` | Historical plans and previous release observations; not current setup instructions. |
| `docs/reference-assets/` | Original JPEGs retained for editing/reference and excluded from application imports. |
| `artifacts/` | Ignored audit screenshots and preserved legacy release ZIP. |

## Dependency rules

- Pages compose features and shared components. Shared components do not import pages.
- A feature keeps its UI, hooks, and behavior together. Create a shared module only when it actually has multiple consumers.
- Browser code must not import `server/`, `api/`, or `build/`.
- `shared/` stays independent of React, browser globals, Node-only modules, and application configuration. Both sides import the same lead schema.
- Use explicit relative imports with extensions. There is no alias configuration to keep in sync across Vite, Node tests, and the editor.
- Keep business identity in `src/config/site.js`; organization schema and social metadata derive their identity values from it.
- Manage Amazon Ads and regional SPN links in `src/config/site.js`. The homepage directory, service links, and generated no-JavaScript directory use this configuration. USA, UK, and India each have Account Management, Advertising Optimization, and Enhanced Brand Content links; the older Cataloguing listing remains India-only.
- Keep verified-content and consent gates intact when moving or reusing components.

## HTML entries and public routes

Vite's root is `src/`. The tiny `src/about/index.html`, `src/contact/index.html`, service, case-study, and legal shells are build entry points. React implementations live under `src/pages/`. These are distinct responsibilities.

`SEO_ROUTES` is the build-entry and metadata registry. Its `entry` values are relative to both the Vite source root and the production output directory. For example:

```text
src/about/index.html -> dist/about/index.html -> /about
```

The Vite configuration explicitly keeps `envDir`, `publicDir`, and `outDir` at the project level. Keep `.env` beside `package.json`. The HTML entry script is `/main.jsx`, relative to Vite's source root. Apache's existing slashless URL rules remain in `public/.htaccess`.

To add a route, update route resolution and SEO metadata, add its HTML shell and page component, connect it in `src/app/RouteView.jsx`, and run the checks and browser route audit. Sitemap inclusion follows the route's existing `indexable` flag.

## Lead capture

`AuditForm.jsx` renders the single form implementation on the home and contact pages. `useAuditForm.js` owns field state, validation, submission, error focus, and funnel events. `submitLead.js` owns browser HTTP delivery. `shared/leadSchema.js` is the common validation contract. The API adapter delegates to `server/leads/leadSubmission.js`.

The browser never receives webhook credentials. Static site hosting still requires a separately deployed API, configured through `VITE_LEAD_API_URL`. Success remains conditional on acknowledged delivery.

## Assets and generated output

Use imports for production images in `src/assets/`. The original JPEGs in `docs/reference-assets/` are retained deliberately and are not build inputs. Do not copy unused artwork into `public/`, which Vite copies wholesale. Keep `public/thank-you.html` available as a legacy URL even though the current form uses inline success.

`dist/`, `node_modules/`, and `artifacts/` are generated/local directories and are ignored by Git. The old root ZIP is preserved at `artifacts/legacy/dist.zip`; it is not the current deployable build. Map audit screenshots are generated into `artifacts/audits/`. Historical screenshots referenced by documentation remain in `docs/screenshots/`.

## Tooling and verification

TypeScript 6.0.x is paired with typescript-eslint 8.70.x because that ESLint release supports TypeScript below 6.1; the previously installed TypeScript 7 compiler was outside its supported range. Do not upgrade the compiler alone without checking parser compatibility.

ESLint checks JavaScript, JSX, TypeScript content, and Node audit scripts using the appropriate environments. Type checking covers the typed content and declaration files; the JSX application is still JavaScript. This reorganization does not imply a full TypeScript migration.

`npm run check` runs lint, type checking, all three test directories, the production build, and SEO output verification. The existing source-contract tests remain useful for content and structural constraints; browser audits verify rendered routes, interactions, keyboard focus, forms, and responsive behavior. New interaction coverage should test behavior instead of requiring a particular private helper or import statement.

With `npm run preview` running, execute `npm run integration:verify`, `npm run responsive:verify`, and `npm run coverage:verify`. Override `CHROME_PATH` for another Chrome installation and `AUDIT_BASE_URL` for another local port. The integration audit simulates form delivery in the browser.

## Main changes from the previous layout

| Previous location | Current location |
| --- | --- |
| Root route folders and HTML files | `src/<route>/index.html`, `src/index.html`, `src/404.html` |
| `src/App.jsx` | `src/pages/home/HomePage.jsx` |
| Routing inside `src/main.jsx` | `src/app/RouteView.jsx` |
| `src/components/MarketingPage.jsx` | Service, about, and contact pages with `MarketingLayout` |
| `src/components/hero/HeroForm.jsx` | `src/features/lead-capture/AuditForm.jsx` and `useAuditForm.js` |
| `src/lead/leadSchema.js` | `shared/leadSchema.js` |
| `src/utils/primaryCta.js` | `src/features/lead-capture/primaryCta.js` |
| `src/components/globalCoverage/` | `src/features/global-coverage/` |
| `src/utils/roiScenario.js` | `src/features/roi-calculator/roiScenario.js` |
| SEO plugin embedded in `vite.config.js` | `build/seoPlugin.js` |
| `src/constants/index.js` | Used container values in `src/styles/layout.js` |

Unused legacy components, compatibility aliases, the obsolete typing hook, duplicate brand adapter, unused Vite icon, and unused motion definitions were removed. Framer Motion was removed after confirming that no rendered component needed it. The retired implementations remain recoverable from the local checkpoint at `artifacts/checkpoints/pre-reorganization/workspace.tar.gz`; historical design plans are archived, not reactivated.
