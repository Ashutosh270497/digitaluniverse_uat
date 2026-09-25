# Digital Universe Pro release-readiness audit

Audit performed: 2026-08-26 to 2026-08-27\
Local target: production Vite build at `http://127.0.0.1:4173/`\
Public target checked: `https://digitaluniversepro.co/`\
Recommendation: **NOT READY**

## Executive decision

The rebuilt local artifact is technically stable: lint, type-check, 79 unit/API tests,
the production build, SEO verification, two browser integration modes, six exact
responsive viewports, reduced-motion checks, and Lighthouse all pass.

Release is blocked by information and infrastructure that cannot safely be invented
in code:

1. Privacy Policy, Terms of Service, and Cookie Policy are not published policies;
   each route is an explicit missing-input notice.
2. No production lead webhook or deployable lead API destination is configured. The
   current Apache static host cannot execute the repository's Node API by itself.
3. No approved booking-calendar URL or completion callback is configured.
4. The public domain still serves the April 2026 build. Canonical-host redirects,
   new routes, `robots.txt`, and `sitemap.xml` are therefore not live.
5. No production analytics provider IDs are supplied, so conversion analytics is
   intentionally inactive.

Do not upload the release until the critical blockers are closed and the complete
post-deployment smoke test passes.

## Audit scope and results

| # | Check | Result | Evidence / limitation |
| ---: | --- | --- | --- |
| 1 | Routes and internal links | Local pass; live fail | 13 React/static entries plus `/thank-you.html` and the 404 UI loaded locally. All discovered internal paths and fragments resolved. The corresponding new public routes currently return 404. |
| 2 | External and social links | Pass with one manual check | Facebook, Instagram, YouTube, WhatsApp, and all four Amazon SPN URLs returned HTTP 200. LinkedIn returned its automated-client block code 999 and must be checked in a normal signed-out browser. |
| 3 | Every active CTA | Pass after fix | Homepage primary CTAs focus the first audit field. Secondary CTA reaches case studies. Internal service and case-study audit CTAs now target `/contact#primary-audit-form`. |
| 4 | Audit-form validation and delivery | Partial / blocked | Empty, invalid email, invalid Amazon URL, browser success UI, and server acknowledgement logic pass. A real production delivery cannot be tested without the approved endpoint and secrets. |
| 5 | Error and retry | Pass | Browser integration forced an acknowledged 502-style failure, confirmed no false success, retried, and then accepted a confirmed success. Server/API unit tests cover 400, 413, 415, 422, 429, 502, and 503 paths. |
| 6 | Calendar flow | Fail | The calendar control is correctly absent because `VITE_BOOKING_CALENDAR_URL` is blank. `calendar_booked` requires an approved provider callback. |
| 7 | WhatsApp, email, and telephone | Automated pass; device check pending | HTTPS/`mailto:`/`tel:` formats pass. WhatsApp resolves to the expected WhatsApp send endpoint. Native mail and telephone applications require physical-device testing. |
| 8 | Legal pages and consent links | Fail | Links resolve, but all three routes say “Not yet published” and enumerate missing inputs. This is a release blocker for a lead-collection website. |
| 9 | Cookie consent | Implementation pass; legal approval blocked | No-provider build shows no unnecessary banner or tag. Consent-enabled test-mode build blocked scripts before consent, kept decline tag-free, reopened settings, and loaded no provider script after acceptance in automated test mode. Provider/legal disclosures remain missing. |
| 10 | Canonical-domain redirect | Live fail | `http://digitaluniversepro.co`, `http://www.digitaluniversepro.co`, and `https://www.digitaluniversepro.co` all returned 200 instead of redirecting to canonical HTTPS non-`www`. The built `.htaccess` contains the intended 301 rule but is not live. |
| 11 | Sitemap and robots | Local pass; live fail | Generated files exactly match the typed route configuration. Both public URLs currently return 404 because the new build is not deployed. |
| 12 | Metadata and structured data | Local pass; live stale | SEO verification passed 14 HTML entries: unique title/description/H1, canonical, Open Graph, Twitter, Organization, FAQ, and Breadcrumb schema. Public homepage still serves the older `amazon-agency-landing` document. |
| 13 | Mobile and responsive layout | Pass | Passed exact viewports 360×800, 390×844, 768×1024, 1024×768, 1366×768, and 1440×900 with no horizontal overflow or off-screen sticky CTA. |
| 14 | Keyboard navigation | Pass | Primary and secondary CTAs, FAQ, form submission, mobile-menu Enter/Escape handling, focus restoration, and visible focus semantics passed. |
| 15 | Screen-reader semantics | Automated pass; manual AT pending | One main landmark, named navigation, permanent form labels, associated errors, live status/alert regions, FAQ expanded state and panel relationships, useful/decorative alt treatment, and accessible control names passed. VoiceOver/NVDA announcement quality remains a manual check. |
| 16 | Reduced motion | Pass | Chrome emulation matched `prefers-reduced-motion: reduce`; root scrolling changed to `auto`. |
| 17 | Analytics events | Code/test pass; production inactive | All requested event names, strict context allowlist, dedupe, SPA tracking, and test-mode suppression pass. No production IDs were supplied. |
| 18 | UTM attribution | Pass | Five allowed UTM parameters are captured, non-allowlisted values are dropped, attribution survives consented form completion in unit tests, and the browser removes the query before third-party tags can load. |
| 19 | 404 behavior | Artifact pass; live stale | The artifact has a noindex custom 404 and Apache `ErrorDocument 404`. The live unknown path returns HTTP 404 but not the new custom page. |
| 20 | Production build | Pass | Vite produced all entries and chunks successfully. Only the non-blocking eight-month-old Browserslist data warning remains. |

## Confirmed defect fixed during QA

### RR-FIX-001 — Cross-page audit CTA did not focus the form

- Original severity: High
- Reproduction: Open a case-study page, activate “Request My Free Amazon Audit,”
  and observe that navigation ended at the homepage heading with no form-field focus.
- Fix: Added one canonical cross-page target,
  `/contact#primary-audit-form`, and a reduced-motion-aware hash focus path that
  scrolls to the form and focuses `#primary-audit-name` after React renders.
- Verification: Unit regression test and production-browser integration test pass.

## Open failures and recommended fixes

### RR-001 — Legal policies are unavailable

- Severity: Critical
- Reproduction:
  1. Open `/privacy-policy`, `/terms-of-service`, or `/cookie-policy`.
  2. Observe “Not yet published” rather than an approved policy.
- Risk: The site collects lead data and proposes optional analytics without approved
  privacy, contractual, processor, retention, jurisdiction, or cookie disclosures.
- Recommended fix: Supply and approve every item in
  `src/content/legalRequirements.js`. Have qualified counsel approve the final policy
  copy. Do not invent a legal entity, address, jurisdiction, retention period, or
  processor.

### RR-002 — Production lead delivery is not configured

- Severity: Critical
- Reproduction:
  1. Build with the current blank environment values.
  2. Submit a valid audit request on the static host.
  3. The browser targets `/api/leads`, but the current Apache static deployment has no
     documented Node/serverless runtime for `api/leads.js`.
- Risk: Qualified leads cannot be delivered. The UI correctly refuses to show success,
  but the primary conversion is unavailable.
- Recommended fix: Deploy `api/leads.js` on a serverless/Node-capable platform or deploy
  a separate HTTPS API. Configure the approved webhook, allowed website origin, stable
  rate-limit salt, authentication if required, and browser API URL. Complete a real
  end-to-end submission to the approved destination before release.

### RR-003 — The public domain is still on the old build

- Severity: Critical deployment blocker
- Reproduction results reconfirmed on 2026-08-27:
  - Public homepage response `Last-Modified`: 2026-04-18.
  - HTTP non-`www`: 200, expected 301.
  - HTTP `www`: 200, expected 301.
  - HTTPS `www`: 200, expected 301.
  - `/about`, `/contact`, `/privacy-policy`, `/robots.txt`, and `/sitemap.xml`: 404.
- Risk: Search consolidation, new page architecture, legal notices, accessibility work,
  and the conversion funnel are not public.
- Recommended fix: After RR-001 and RR-002 are closed, deploy the complete `dist/`
  contents including the hidden `.htaccess` file. Verify Apache rewrite support before
  sending traffic.

### RR-004 — Calendar booking is unconfigured

- Severity: High
- Reproduction: Complete a simulated successful form submission; no booking action is
  rendered because `VITE_BOOKING_CALENDAR_URL` is blank.
- Recommended fix: Supply the verified public HTTPS calendar URL. If the provider
  supports a confirmed-completion callback, connect it to `trackCalendarBooked` using an
  opaque, non-PII dedupe reference. Never infer a booking from a link click.

### RR-005 — Production conversion analytics is inactive

- Severity: High for measurement; not a page-function failure
- Reproduction: Build with the current environment template; the provider configuration
  is empty, the preference banner is hidden, and no analytics event is transmitted.
- Recommended fix: After legal approval, supply the approved GA4 ID and any approved
  optional provider IDs. Validate in provider test/realtime tools and confirm payloads
  contain no lead-field values.

### RR-006 — LinkedIn destination needs human verification

- Severity: Medium
- Reproduction: Automated request to the company URL returns LinkedIn code 999, while
  other social URLs return 200.
- Recommended fix: Open the footer LinkedIn link in a signed-out desktop and mobile
  browser and confirm it resolves to the intended public company page.

### RR-007 — `dist.zip` is stale and untracked

- Severity: Medium deployment risk
- Reproduction: The repository contains an untracked `dist.zip` associated with the old
  April deployment while the current `dist/` has different hashed assets.
- Recommended fix: Do not deploy or use that archive for rollback. Create a fresh,
  dated artifact only after final approved environment configuration, or keep deployment
  artifacts outside source control.

### RR-008 — Browser support data is stale

- Severity: Low
- Reproduction: Production build reports that `caniuse-lite` is eight months old.
- Recommended fix: Update Browserslist data in a separate dependency-maintenance change,
  then rerun the complete build and browser suite.

## Passed command evidence

```text
npm run lint                         PASS
npm run type-check                   PASS
npm test                             PASS — 79/79
npm run build                        PASS
npm run seo:verify                   PASS — 14 HTML entries
npm run responsive:verify            PASS — six requested viewports
npm run integration:verify           PASS — routes, links, CTAs, forms, keyboard, UTM
AUDIT_EXPECT_CONSENT=true ...         PASS — consent test-mode build
git diff --check                     PASS
```

External broken-link scan results:

| Destination | Automated result |
| --- | ---: |
| Facebook | 200 |
| Instagram | 200 |
| YouTube | 200 |
| WhatsApp | 200 after one expected redirect |
| Amazon SPN — Account Management | 200 |
| Amazon SPN — Advertising Optimization | 200 |
| Amazon SPN — Cataloguing | 200 |
| Amazon SPN — Enhanced Brand Content | 200 |
| LinkedIn company page | 999 anti-automation response; manual check required |

## Lighthouse and accessibility measurements

| Target | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage mobile | 99 | 100 | 100 | 100 | 1.4 s | 1.7 s | 0 ms | 0 |
| Homepage desktop | 100 | 100 | 100 | 100 | 0.3 s | 0.4 s | 0 ms | 0 |
| Contact mobile | 99 | 100 | 100 | 100 | 1.4 s | 1.8 s | 0 ms | 0 |

These are local lab measurements, not production field data. Production caching,
compression, CDN behavior, server latency, and Core Web Vitals must be measured after
deployment.

## Required environment variables

### Required to make lead delivery operational

| Variable | Runtime | Requirement |
| --- | --- | --- |
| `LEAD_WEBHOOK_URL` | Server | Approved HTTPS CRM/webhook/email-automation destination. |
| `LEAD_ALLOWED_ORIGINS` | Server | Must include `https://digitaluniversepro.co` and no unapproved origins. |
| `LEAD_RATE_LIMIT_SALT` | Server secret | Stable random value; recommended before multi-instance production. |
| `VITE_LEAD_API_URL` | Browser | Required for the current static Apache site unless `/api/leads` is reverse-proxied to a deployed API. |

### Required for the intended success flow

| Variable | Runtime | Requirement |
| --- | --- | --- |
| `VITE_BOOKING_CALENDAR_URL` | Browser | Verified public HTTPS booking URL. |

### Destination-dependent server configuration

| Variable | Purpose |
| --- | --- |
| `LEAD_WEBHOOK_BEARER_TOKEN` | Optional webhook authentication; server secret. |
| `LEAD_RATE_LIMIT_MAX` | Defaults to 5. |
| `LEAD_RATE_LIMIT_WINDOW_MS` | Defaults to 600000 ms. |
| `LEAD_WEBHOOK_TIMEOUT_MS` | Defaults to 8000 ms. |

### Consent-approved analytics configuration

| Variable | Purpose |
| --- | --- |
| `VITE_GA4_MEASUREMENT_ID` | GA4 web stream ID. |
| `VITE_CLARITY_PROJECT_ID` | Optional approved Clarity project. |
| `VITE_META_PIXEL_ID` | Optional approved Meta Pixel. |
| `VITE_LINKEDIN_PARTNER_ID` | Optional approved LinkedIn Insight partner. |
| `VITE_LINKEDIN_CONVERSION_IDS_JSON` | Approved event-to-conversion-ID map. |
| `VITE_ANALYTICS_DEBUG` | Keep `false` in ordinary production operation. |

No production secret or identifier is committed in the repository.

## Deployment steps

1. Close RR-001: approve complete legal policies and update the legal routes.
2. Provision the lead API and approved destination. Configure server secrets outside Git.
3. Set `VITE_LEAD_API_URL` for the static host, unless Apache is explicitly configured
   to proxy same-origin `/api/leads` to the deployed API.
4. Supply and validate the approved booking-calendar URL and callback.
5. Approve analytics providers and policy disclosures, then configure only the supplied
   production IDs.
6. Run `npm ci`, lint, type-check, unit tests, integration verification, build, SEO
   verification, responsive verification, Lighthouse, and external-link checks.
7. Create a dated backup of the current public document root and record current server
   environment/rewrite configuration. Do not use the repository's stale `dist.zip`.
8. Upload the contents of the newly generated `dist/` to the Apache document root,
   including `.htaccess`, `404.html`, route directories, `robots.txt`, and `sitemap.xml`.
9. Confirm that Apache permits `.htaccess` overrides and `mod_rewrite` rules.
10. Deploy or enable the lead API separately, then run the post-release smoke tests below.
11. Only after successful smoke testing should campaigns or high-volume traffic be enabled.

## Rollback plan

1. Keep a dated, checksummed backup of the pre-release public document root outside the
   live directory.
2. Prefer an atomic directory/symlink switch. If the host does not support that, restore
   the complete previous document-root backup, including its hidden files.
3. Roll back the lead API independently to the last known-good version and restore its
   previous environment configuration from the deployment platform—not from Git.
4. Purge host/CDN caches after rollback.
5. Recheck the homepage, primary CTA, form failure behavior, canonical hostname, and 404.
6. Record the rollback time, reason, affected requests, and any leads requiring manual
   follow-up. Never use an unverified or stale ZIP as the rollback source.

## Post-release smoke tests

1. Verify HTTP and `www` variants return one permanent redirect to
   `https://digitaluniversepro.co` without a chain.
2. Verify all sitemap routes return 200 at slashless canonical URLs; trailing slash and
   `index.html` variants must 301 to those URLs.
3. Verify `/robots.txt` and `/sitemap.xml` return 200 with the canonical hostname.
4. Verify an unknown URL returns the branded 404 body with HTTP 404 and noindex metadata.
5. Submit one approved QA lead using a clearly labelled test record. Confirm arrival in
   the real destination, acknowledgement in the UI, next-step copy, and no PII in logs.
6. Force one controlled API failure and confirm the site shows failure, permits retry,
   and never claims receipt.
7. Complete one test calendar booking and confirm `calendar_open` and, only from the
   provider callback, `calendar_booked`.
8. Test WhatsApp, both telephone links, email, and each social profile on mobile and
   desktop. Manually confirm LinkedIn reaches the intended company page.
9. Accept and decline analytics from clean sessions. Confirm no provider request before
   consent, one page view after acceptance, no duplicate SPA event, and no PII payload.
10. Load a tagged landing URL and confirm the same UTM attribution reaches CTA, form
    start, form success, and calendar booking events.
11. Test keyboard-only navigation, mobile-menu Escape focus restoration, FAQ state,
    empty/error form announcements, and reduced motion with VoiceOver or NVDA.
12. Run Lighthouse against canonical production HTTPS and inspect real response headers
    for compression and immutable caching of hashed assets.

## Final recommendation

**NOT READY.** The application artifact is technically releaseable after the verified
CTA repair, but legal policies, real lead delivery, calendar integration, analytics
configuration, and the actual Apache deployment/redirect state are incomplete. These
are release blockers, not optional polish.
