# Digital Universe Pro conversion baseline

Baseline date: 2026-08-25

Repository: `amazon-agency-landing`

Production URL supplied for this review: `https://digitaluniversepro.co/`

> Historical note: this file captures the pre-enhancement baseline. The FormSubmit
> implementation described below has since been retired. The current lead-delivery
> contract is documented in `docs/lead-funnel.md`.

This document records the repository as it exists in the working tree, including the uncommitted Draya AI work. A read-only production cross-check confirmed that the live URL is serving an older build, not the current working tree. The repository still contains no configuration that documents the production upload workflow.

## Scope and working-tree safety

No visual or application behavior was changed during this baseline. The only intended source-controlled addition from this task is this document.

Pre-existing user changes were preserved:

- Modified: `index.html`
- Modified: `src/App.jsx`
- Modified: `src/components/Footer.jsx`
- Modified: `src/components/StickyHeader.jsx`
- Modified: `src/config/site.js`
- Modified: `vite.config.js`
- Untracked: `DRAYA_AI_IMPLEMENTATION.md`
- Untracked: `assets/brand_logos/logo.jpg`
- Untracked: `dist.zip`
- Untracked: `src/components/DrayaAISection.jsx`

No `AGENTS.md` exists in the repository or its parent project directory. The relevant repository guidance is the root `README.md`, the untracked `DRAYA_AI_IMPLEMENTATION.md`, and `.claude/settings.local.json`.

## Current architecture

| Area | Current implementation |
| --- | --- |
| Framework | React 19.2.3 with React DOM 19.2.3 |
| Rendering strategy | Client-side rendered single-page application. `index.html` contains an empty `#root`; `src/main.jsx` mounts React under `StrictMode`. There is no SSR, SSG, prerendering, or hydration. |
| Build system | Vite 7.3.1 with `@vitejs/plugin-react` |
| Package manager | npm 11.6.1 with `package-lock.json`; Node used for the baseline was v22.14.0 |
| Styling | Tailwind CSS 3.4.19, PostCSS, Autoprefixer, a custom Tailwind theme, and global CSS utilities/keyframes in `src/index.css` |
| Typography | Inter is fetched at runtime from Google Fonts through a CSS `@import`; system fonts are the fallback |
| Animation | Framer Motion 12.25.0 plus CSS animations. Motion is used throughout the page and does not currently honor `prefers-reduced-motion`. |
| Icons | Lucide React 0.562.0 |
| Routing | No routing library. The React application has one route/page. In-page navigation uses element IDs and `scrollIntoView`. |
| Static page | `public/thank-you.html` is copied to `/thank-you.html` at build time and is not part of React. |
| Shared configuration | `src/config/site.js` centralizes contact details, social links, SPN links, legal placeholders, Draya config, and form submission helpers. |
| Shared content | Client logo lists live in `src/data/brands.js`. Most other copy, proof, services, testimonials, and metrics are hard-coded inside components. |
| Hosting evidence | The repository supports `gh-pages -d dist`, but production responds through Apache and injects a `secureserver.net`/`wsimg.com` hosting-monitor script, which is consistent with GoDaddy-hosted infrastructure. There is no source-controlled Apache, cPanel, GitHub Actions, `CNAME`, Netlify, Vercel, or Cloudflare deployment configuration. The upload workflow remains unknown. |
| Vite base | The working tree changes `base` from `/amazon_landing_page_client_1/` to `./`, producing relative asset URLs. |

### Entry and composition

- `index.html`: minimal document shell, favicon, viewport, and generic title.
- `src/main.jsx`: imports global CSS and mounts `App`.
- `src/App.jsx`: renders the entire landing page and global overlays in a fixed order.
- `src/index.css`: Tailwind layers, Google Fonts import, global smooth scrolling, and utility animations.
- `tailwind.config.js`: amber/gold `primary` and `amazon` theme tokens with an Inter font stack.

### Shared-versus-local state

There is no global store or context. All interactivity is local component state:

- form values, validation errors, and submission state;
- countdown and randomized spot count;
- sticky-header visibility and menus;
- ticker/carousel/FAQ indices;
- ROI inputs and calculated-state toggle;
- floating tooltip and social-proof visibility.

## Production cross-check

The supplied production URL was inspected read-only on 2026-08-25:

- `https://digitaluniversepro.co/` returned HTTP 200 from `server: Apache`.
- Production `index.html` loads `assets/index-DCgaEVq8.js` and `assets/index-CoIJ3pnx.css`.
- Those filenames match the untracked `dist.zip` archive dated 2026-04-18.
- The current working-tree build generates `index-DHcEhQuc.js` and `index-DGkiRmZO.css`; the current JavaScript filename returned HTTP 404 from production.
- The live HTML has the same generic `amazon-agency-landing` title and empty React root.
- Production injects `_trfq`/`_trfd` monitoring and `https://img1.wsimg.com/traffic-assets/js/tccl.min.js` after the application HTML. This script is not present in the repository and is described in the injected comment as hosting performance monitoring.
- The live `thank-you.html` returned HTTP 200.
- Draya AI strings are absent from the archived/live JavaScript build, so the uncommitted Draya feature is not currently live.

This makes `dist.zip` stale relative to the working tree but likely the closest repository artifact to the current production deployment.

## Pages and routes

| URL/route | Source | Rendering | Purpose |
| --- | --- | --- | --- |
| `/` or the deployment directory's `index.html` | `index.html`, `src/main.jsx`, `src/App.jsx` | Client-rendered React | Main ScaleAmazon/Digital Universe landing page |
| `/thank-you.html` relative to the deployed build | `public/thank-you.html` | Static HTML | Post-submission confirmation with WhatsApp and return actions |

There are no React routes and no not-found route. Vite preview may fall back to `index.html` for unknown paths, but that is not an application routing implementation.

### In-page anchors

| Anchor | Component | Consumers |
| --- | --- | --- |
| `#services` | `Services.jsx` | Footer “Services” |
| `#results` | `WhyChooseUs.jsx` | Footer “Results” |
| `#draya-ai` | `DrayaAISection.jsx` | No current direct navigation link |
| `#faq` | `FAQ.jsx` | Footer “FAQ” |
| `#contact` | `ContactForm.jsx` | Most conversion CTAs and Footer “Contact” |

## Homepage display order

The current `src/App.jsx` working-tree order is:

1. `FloatingElements` — fixed decorative background
2. `UrgencyBanner` — offer, countdown, changing spot count, claim CTA
3. `StickyHeader` — becomes visible after 600px of scroll
4. `HeroWithForm`
   - typed hero messaging
   - hero KPI strip
   - externally hosted world map
   - Amazon partner badges
   - `HeroForm`
5. `LiveActivityTicker`
6. `Stats`
7. `AchievementBadges`
8. `TrustedBrands`
9. `ClientLogosMarquee`
10. `Services`
11. `RealClientDashboards`
12. `ROICalculator`
13. `CaseStudies`
14. `Testimonials`
15. `MeetTheExpert`
16. `WhyChooseUs`
17. `IsItWorthIt`
18. `BookConsultation`
19. `DrayaAISection` — uncommitted cross-sell implementation
20. `FAQ`
21. `ContactForm`
22. `Footer`
23. `WhatsAppFAB` — fixed overlay
24. `SocialProofPopup` — fixed timed overlay

On mobile, the hero's left column—including stats, map, and partner badges—renders before the hero form. This pushes the highest-intent form substantially below the initial hero message.

## Form submission implementation

Both lead forms use the same `submitLeadForm` helper in `src/config/site.js`.

The helper:

1. creates a hidden native `<form>` in the browser;
2. sets method `POST` and action `https://formsubmit.co/Gautamsoni4422@gmail.com`;
3. adds hidden inputs for `_subject`, `_template=table`, `_captcha=false`, `_next`, `_replyto`, `form_name`, and supplied fields;
4. appends the form to `document.body`;
5. calls the browser's native `form.submit()`;
6. removes the temporary form.

Submission therefore navigates away from React. There is no fetch request, JSON API, application-owned backend, CRM integration, persistent lead ID, deduplication, server-side validation, retry behavior, or in-app success state.

### Hero lead form

Source: `src/components/hero/HeroForm.jsx`

| Field | Required by JavaScript | Notes |
| --- | --- | --- |
| Name | Yes | Trimmed non-empty check |
| Email | Yes | Simple regex check |
| Phone | Yes | Non-empty only; no normalization or country validation |
| Amazon Store/Product Link | No | Browser `type=url` is used |
| Service Type | Yes | Account Management, PPC Optimization, Listing Optimization, Brand Registry & A+ Content, Amazon Premium Creative, Storefront of Amazon, or Full Service Package |
| Business notes | No | Sent as `N/A` when empty |

Subject: `New Lead - Hero Free Audit Form`

Payload also includes browser-local `submittedAt`. The submit CTA changes to “Submitting...” before native navigation. The form shows “By submitting, you agree to our Terms & Privacy Policy,” but neither phrase is linked.

### Bottom contact form

Source: `src/components/ContactForm.jsx`

| Field | Required by JavaScript | Notes |
| --- | --- | --- |
| Full Name | Yes | Trimmed non-empty check |
| Brand Name | Yes | Trimmed non-empty check |
| Monthly Revenue | Yes | `$0-$10,000`, `$10,000-$50,000`, `$50,000-$100,000`, `$100,000-$500,000`, or `$500,000+` |
| Email | Yes | Simple regex check |
| Phone | Yes | Non-empty only |
| Message | No | Sent as `N/A` when empty |

Subject: `New Lead - Contact Form`

The right-hand side repeats email, two telephone actions, location, and a WhatsApp CTA.

### Redirect behavior

Both forms calculate `THANK_YOU_PATH` from `import.meta.env.BASE_URL`, then `submitLeadForm` resolves it against `window.location.origin`. With the current `base: './'`, `new URL('./thank-you.html', window.location.origin)` resolves to the domain root. This works for a root-domain deployment but can redirect incorrectly for a GitHub Pages subdirectory deployment.

## Current conversion funnel

### Primary Amazon-services funnel

1. Visitor lands on an urgency offer and hero value proposition.
2. Visitor can submit the hero audit form or continue through proof, services, result claims, ROI projection, testimonials, and expert positioning.
3. Most mid-page CTAs scroll to `#contact`.
4. Visitor converts through the bottom form, WhatsApp, telephone, email, or the already-available hero form.
5. FormSubmit emails the lead to the configured Gmail inbox and attempts to redirect to `thank-you.html`.
6. The thank-you page offers WhatsApp and a return link.

### Draya cross-sell funnel

1. After 600px scroll, the sticky header exposes “Our Platforms.”
2. The visitor can choose Draya AI or reach the dedicated section between consultation content and FAQ.
3. Website CTAs currently target `#`, so the working Draya conversion path is only its WhatsApp link.
4. The shared bottom form remains Amazon-specific and has no Draya service or source field.

### Measurement status

There is no repository-owned analytics implementation, so none of these stages can currently be measured inside the application. There is no event taxonomy, pageview integration, CTA tracking, form-start event, validation event, form-submit event, thank-you conversion, phone/email click event, WhatsApp click event, scroll-depth event, campaign attribution, consent state, or ad-platform pixel. The live host's injected `_trfq`/`_trfd` script is infrastructure monitoring, not an application conversion analytics implementation.

## CTA and interaction map

### Global, urgency, and header

| Surface | Label/control | Handler/destination | Status |
| --- | --- | --- | --- |
| Urgency banner | Claim Now | Smooth-scroll to `#contact` | Working |
| Urgency banner | Close icon | Hides banner for current component lifetime | Working; not persisted |
| Sticky header | Our Platforms | Toggles desktop dropdown | Working after header appears |
| Sticky header | ScaleAmazon | Smooth-scroll to page top | Working |
| Sticky header | Draya AI | `window.open(DRAYA_CONFIG.websiteUrl)` | Placeholder because URL is `#` |
| Sticky header | Primary phone | `tel:+916387104378` | Working |
| Sticky header | Get Free Audit | Smooth-scroll to `#contact` | Working |
| Sticky header | Mobile menu | Toggles platform menu | Working |

### Hero through services

| Surface | Label/control | Handler/destination | Status |
| --- | --- | --- | --- |
| Hero form | Get Free Audit Now | Client validation then FormSubmit POST | Implemented; third-party dependency |
| Trusted brands | Logo cards | None despite `cursor-pointer` styling | False affordance |
| Logo marquee | Logo cards | None | Display-only |
| Services 1 | Explore on SPN | Account Management SPN URL | External link |
| Services 2 | Explore on SPN | Advertising Optimization SPN URL | External link |
| Services 3 | Explore on SPN | Cataloguing SPN URL | External link |
| Services 4 | Explore on SPN | Enhanced Brand Content SPN URL | External link |
| Services 5 | Explore on SPN | Reuses Account Management SPN URL | Working URL; destination may not match label |
| Services 6 | Explore on SPN | Reuses Account Management SPN URL | Working URL; destination may not match label |
| Services 7 | Learn More | Smooth-scroll to `#contact` | Working |
| Services footer | Book Your Free Consultation | Smooth-scroll to `#contact` | Working |

### Results, calculator, and case studies

| Surface | Label/control | Handler/destination | Status |
| --- | --- | --- | --- |
| Client dashboards | Graph view | No handler | Dead button |
| Client dashboards | Table view | No handler | Dead button |
| Client dashboards | What is this | Rendered as underlined text, not a link | False affordance |
| ROI calculator | Dollar / INR / Pound | Updates currency state | Working; rates hard-coded |
| ROI calculator | 1 / 2 / 3 Year | Updates multiplier and period state | Working |
| ROI calculator | Custom | Opens prefilled ScaleAmazon WhatsApp URL | Working |
| ROI calculator | Calculate My Potential | Reveals calculated result cards | Working |
| ROI results | Get Your Free Strategy Session | Smooth-scroll to `#contact` | Working |
| Case studies | Previous / next | Changes carousel index | Working |
| Case studies | Three slide indicators | Sets carousel index | Working; controls have no accessible labels |
| Case studies | Connect with Us | Styled `<div>` with no click handler | Dead CTA |

### Lower-page conversion sections

| Surface | Label/control | Handler/destination | Status |
| --- | --- | --- | --- |
| Testimonials | Get Free Consultation Call | Smooth-scroll to `#contact` | Working |
| Expert | Schedule a Consultation | Smooth-scroll to `#contact` | Working |
| Why Choose Us | Book Now | Smooth-scroll to `#contact` | Working |
| Is It Worth It | Book Your Free Strategy Call | Smooth-scroll to `#contact` | Working |
| Consultation | Book A Consultation Call | Smooth-scroll to `#contact` | Working |
| Draya service cards | Learn More, six instances | Opens `DRAYA_CONFIG.websiteUrl` | Placeholder `#`; functionally dead |
| Draya section | Explore Draya AI | Opens `DRAYA_CONFIG.websiteUrl` | Placeholder `#`; functionally dead |
| Draya section | WhatsApp Draya AI | Opens prefilled WhatsApp URL | Working; currently same phone as ScaleAmazon |
| FAQ | Six question rows | Opens/closes local accordion | Working; missing expanded-state ARIA |
| FAQ footer | Contact Us | Smooth-scroll to `#contact` | Working |

### Contact, footer, and overlays

| Surface | Label/control | Handler/destination | Status |
| --- | --- | --- | --- |
| Contact form | Submit Now | Client validation then FormSubmit POST | Implemented; third-party dependency |
| Contact card | Support email | `mailto:support@digitaluniversepro.co` | Working |
| Contact card | Two phone numbers | `tel:` links | Working |
| Contact card | Chat on WhatsApp | Opens default WhatsApp URL | Working |
| Footer | Facebook | Configured Facebook profile | External link |
| Footer | LinkedIn | `https://www.linkedin.com/feed/` | Opens generic signed-in feed, not a company/profile page |
| Footer | Instagram | Configured Digital Universe profile | External link |
| Footer | YouTube | Configured channel | External link |
| Footer | Services / Results / FAQ / Contact | Smooth-scroll to corresponding anchor | Working |
| Footer | Email and two phones | `mailto:` and `tel:` | Working |
| Footer | Privacy / Terms / Cookie | `#` | Dead legal links |
| Footer | Fixed up-arrow | Smooth-scroll to page top | Working; always rendered |
| WhatsApp FAB | Main button | Opens default WhatsApp URL | Handler exists; pulse overlay should be tested for pointer interception |
| WhatsApp FAB | Tooltip close | Hides tooltip while hovered | Working but tooltip normally also hides on mouse leave |
| Social-proof popup | Close | Dismisses popup until remount | Working |
| Thank-you page | Chat on WhatsApp | Hard-coded WhatsApp URL/message | Working |
| Thank-you page | Back to Landing Page | `./` | Working when thank-you page shares deployment directory |

## External-link and service inventory

| Category | Destination/use |
| --- | --- |
| Form delivery | `https://formsubmit.co/Gautamsoni4422@gmail.com` |
| WhatsApp | `wa.me/916387104378` for both ScaleAmazon and Draya, with different messages |
| Email | `support@digitaluniversepro.co`; lead inbox is `Gautamsoni4422@gmail.com` |
| Phone | `+91 63871 04378` and `+91 92080 24236` |
| Social | Facebook profile, generic LinkedIn feed, Instagram profile, YouTube channel |
| Amazon | Four Amazon Seller Central SPN provider URLs; Account Management is reused for three service cards |
| Draya website | `#` placeholder |
| Legal | Privacy, Terms, and Cookie are all `#` placeholders |
| Font | Google Fonts CSS for Inter |
| Map | Wikimedia-hosted world map PNG |

All URLs and contact data are public client-side values. No environment variables are used.

## Analytics implementation and event map

No analytics SDK, script tag, tag manager, pixel, event helper, consent manager, or analytics environment variable exists in the repository.

Searches found no implementation of GA/GA4, Google Tag Manager, Meta Pixel, LinkedIn Insight, Microsoft Clarity, Hotjar, Plausible, Segment, Mixpanel, or PostHog.

Current repository-owned analytics events: **none**.

Production additionally contains a hosting-injected `_trfq`/`_trfd`/`tccl.min.js` script. Its data ownership, retention, consent behavior, and reporting access are not documented in the repository and require confirmation from the hosting account owner.

The first event taxonomy should cover at least:

- `page_view`
- `cta_click` with CTA ID, label, section, and destination
- `form_start`
- `form_validation_error`
- `lead_submit_attempt`
- `lead_submit_success` or confirmed thank-you view
- `lead_submit_failure`
- `whatsapp_click`
- `phone_click`
- `email_click`
- `spn_click`
- `draya_click`
- calculator use and result view
- FAQ open
- scroll-depth milestones

Consent requirements and the preferred analytics platform must be confirmed before implementation.

## SEO implementation

### Present

- `<html lang="en">`
- UTF-8 charset
- responsive viewport
- favicon
- generic document title: `amazon-agency-landing`
- semantic headings and sections inside React

### Missing

- useful production title and meta description
- canonical URL
- Open Graph and Twitter/X metadata
- structured data/JSON-LD for Organization, ProfessionalService, FAQ, and breadcrumbs where applicable
- `robots.txt`
- sitemap
- production-domain/CNAME configuration
- crawl directives for the thank-you page; it should normally be `noindex`
- server-rendered or prerendered landing-page HTML
- route-specific metadata

Because the homepage is entirely client-rendered, the source HTML contains no marketing content until JavaScript executes.

## Client-result data and hard-coded claims

All items below are embedded in source code rather than loaded from an audited data source or CMS.

### Urgency and real-time proof

- “30% OFF First Month.”
- Countdown always starts at 23:59:59 on mount.
- Spots start at 7 and randomly decrease toward 3 every 30 seconds.
- Live ticker claims:
  - 127% sales increase for “TechGear Pro”;
  - bestseller rank #3 in Electronics;
  - $45,000 revenue generated this week;
  - 2,500 units sold in 24 hours;
  - a new seller onboarded from California;
  - ACoS reduced from 35% to 15%.
- Social-proof popup uses five hard-coded abbreviated identities and claims including 340% sales growth, Best Seller status, and 45% ACoS reduction. It labels these records “Verified by ScaleAmazon.”

### Hero, map, and summary proof

- Trusted by 500+ Amazon sellers.
- $50M+ revenue generated.
- 500+ sellers managed.
- 1.8B+ ad spend managed; no currency is shown.
- 15+ marketplaces, 50+ countries, and 24/7 global support.
- “Amazon Global Selling — Solution Provider Network.”
- “Amazon Ads — Verified Partner.”
- “127 sellers got their audit this week.”
- “NDA Protected,” “24hr Response,” and “5-Star Rated.”

### Stats and badges

- 500+ active sellers.
- $108M+ revenue generated, described as total client sales in 2024.
- 43,655+ units sold.
- 41,953+ orders processed.
- Top 1% Amazon Partners.
- Certified Ads Specialist.
- Verified Service Provider.
- 5-Star Client Rating.
- 98% Success Rate.
- Fast Results Delivery.

### Brand proof

- 18 brand records are rendered: 11 international and 7 Indian clients.
- The marquee claims 500+ brands worldwide, 15+ industries, 25+ categories, 100M+ products managed, and 99.9% uptime.
- `TrustedBrands` and `ClientLogosMarquee` render the same brand data in two consecutive sections.

### Client dashboard records

`RealClientDashboards.jsx` hard-codes six Amazon-style records:

| Date range | Market | Orders | Units | Sales | Average sales/order |
| --- | --- | ---: | ---: | ---: | ---: |
| 1/6/2025-30/6/2025 | IN | 17,298 | 17,932 | ₹46,57,877.00 | ₹269.27 |
| 7/1/2025-7/31/2025 | US | 1,186 | 1,307 | $107,968.26 | $91.04 |
| 6/1/2025-6/30/2025 | US | 961 | 1,099 | $97,149.80 | $101.09 |
| 12/1/2025-1/31/2025 | IN | 1,876 | 1,932 | ₹4,91,377.88 | ₹261.93 |
| 10/7/2025-11/7/2025 | IN | 1,002 | 1,040 | ₹2,85,795.12 | ₹285.22 |
| 1/7/2025-31/7/2025 | IN | 19,630 | 20,345 | ₹53,64,884.00 | ₹273.30 |

The section displays aggregate claims of 41,953+ orders, 43,655+ units, ₹1.1Cr+ revenue, and 100% client success. It describes the cards as screenshots and verified data, but the page renders recreated dashboard UI and generated mini charts rather than the source screenshots.

### ROI calculator

- Currency rates are fixed at USD 1, INR 83 per USD, and GBP 0.79 per USD.
- The formulas are:
  - one year: revenue + ad spend × 3;
  - two years: revenue + ad spend × 4;
  - three years: revenue + ad spend × 6.
- “Projected ROI” is gain divided by the unchanged ad spend. It therefore resolves to 300%, 400%, or 600% regardless of current revenue.
- Period labels imply annual projections, but current revenue and ad spend are monthly values and are not multiplied by months or years.

### Case studies

- Case 1: 73% growth in 12 months; $1.68M to $2.9M; dashboard sales $4.66M.
- Case 2: #1 Kitchen Accessories seller in eight months; ROI from 45% to 156%; Best Seller badge across five product lines; dashboard sales $5.36M.
- Case 3: $500K to $2.2M in ten months/340% growth; ACoS from 52% to 28%; expansion to five marketplaces; dashboard sales $2.86M.
- Brands are not identified, citations are not linked, and the dashboards are visual mocks.

### Testimonials and expert claims

- Four hard-coded testimonials dated April-June 2025 are labeled Verified; two explicitly name Digital Universe.
- Gautam Soni is described as an award-winning strategist with 7+ years of experience.
- The expert section claims 500+ brands helped, $100M+ revenue generated, and 98% success rate.
- `WhyChooseUs` and the FAQ repeat 500+ sellers and $50M+ revenue.

### Claim consistency risk

The page presents at least three different top-line revenue figures—$50M+, $100M+, and $108M+—without defining scope or time period consistently. “500+” alternates between sellers, active sellers, brands, and brands helped. These claims require an evidence register and approved wording before conversion optimization.

## Duplicated components and implementation patterns

- `HeroForm` and `ContactForm` duplicate form state, validation, error handling, and submission orchestration with different field schemas.
- `TrustedBrands` and `ClientLogosMarquee` duplicate the same brand proof back-to-back.
- KPI proof is repeated in `HeroStats`, `Stats`, `AchievementBadges`, `ClientLogosMarquee`, `RealClientDashboards`, `MeetTheExpert`, `WhyChooseUs`, and FAQ copy.
- Smooth-scroll-to-contact logic is duplicated inline across the sticky header and most conversion sections.
- Contact information is repeated in the sticky header, contact section, footer, and static thank-you page. The thank-you page is not driven by `SITE_CONFIG`.
- Card, button, background-pattern, heading, and motion styles are repeatedly hard-coded even though `src/constants/index.js` defines many unused style constants.
- The dashboard cards and case-study dashboard each implement separate Amazon dashboard simulations.
- Several large content arrays live inside render functions, making content governance and evidence tracking difficult.

## Dead code and unused assets

- `getLeadMailtoHref` in `src/config/site.js` is unused.
- Nearly every export in `src/constants/index.js` is unused; current consumers use only `CONTAINER`.
- `public/vite.svg` is unused but copied to production.
- `public/expert-photo.jpg` is unused; `MeetTheExpert` imports `assets/amazon_pics/br_12.jpeg` instead.
- Most files under `assets/amazon_pics` are unused by source; only `br_12.jpeg` is imported.
- `assets/brand_logos/geocarter.jpeg` is not present in the brand data arrays.
- `src/links.md` duplicates values now present in `src/config/site.js`.
- The untracked `dist.zip` predates the current Draya implementation and its asset hashes match production, while the ignored `dist/` generated from the current source contains Draya strings.

## Known defects and conversion risks

### Critical or blocking

1. **No analytics:** conversion rate, CTA effectiveness, form abandonment, channel attribution, and production errors cannot be measured.
2. **Unverified/fabricated-looking proof:** randomized scarcity, static “LIVE” events, hard-coded verified identities, and conflicting claims can damage trust and may create advertising/compliance exposure.
3. **Legal links are dead:** form consent language is not backed by accessible Privacy or Terms pages; Cookie Policy is also `#`.
4. **Draya links are placeholders:** all website CTAs open `#`, and the cross-sell can distract from Amazon conversion without creating a functioning destination.
5. **Form ownership and privacy:** personally identifiable lead data posts to a third-party service and personal Gmail address with CAPTCHA explicitly disabled. There is no server-side validation, spam control, consent record, privacy linkage, or CRM confirmation.

### High priority

6. **Deployment workflow is unverified:** production is observable on Apache/GoDaddy-style hosting, while the repo exposes a GitHub Pages command; no configuration explains who uploads the Apache build or from which branch/artifact.
7. **Potential subpath redirect defect:** the relative Vite base plus origin-based `_next` resolution can send GitHub Pages submissions to the wrong thank-you URL.
8. **Brand inconsistency:** UI and configuration use ScaleAmazon, testimonials and the thank-you page use Digital Universe, and the new cross-sell introduces Draya AI.
9. **Dead CTAs and false affordances:** dashboard toggles, case-study Connect with Us, legal links, clickable-looking brand cards, and Draya website actions do nothing useful.
10. **ROI output is not a defensible ROI model:** it produces fixed percentages from arbitrary multipliers and mixes monthly inputs with yearly labels.
11. **README is stale:** it says forms only log to the console and documents the old GitHub Pages base.
12. **No test/type-check coverage:** there is no regression safety for forms, links, calculations, timers, responsive behavior, or deployment paths.

### UX, accessibility, and performance

13. Hero form placement is late on mobile because the map and proof content precede it.
14. Multiple fixed overlays can compete: WhatsApp, scroll-to-top, and social proof.
15. CTA language is inconsistent: Free Audit, Consultation, Strategy Session, Book Now, Claim Now, and Contact Us all lead to substantially the same destination.
16. FAQ and carousel controls lack complete ARIA state/labels; several icon-only close buttons are unlabeled.
17. Range labels are not associated with form controls, and there is no accessible calculator-result announcement.
18. Animations do not respect reduced-motion settings. Many perpetual animations and timers run simultaneously.
19. Google Fonts and the world map are runtime third-party dependencies; the hero map has no local fallback asset.
20. The current build is a single 474.27 kB JavaScript bundle (138.60 kB gzipped), with all below-the-fold sections loaded up front.
21. `SocialProofPopup` schedules the next display inside a hide timer, but effect cleanup can clear that newly scheduled timer when visibility changes; recurring proofs may stop after the first popup.
22. `useTypingEffect` can schedule multiple pause timeouts and does not clear them on effect cleanup.
23. The WhatsApp FAB's animated pulse is an absolutely positioned sibling above the button without `pointer-events-none`; browser interaction should confirm it does not intercept taps.
24. A Stats shimmer animation contains a Unicode minus in `−100%`, which is not a valid CSS numeric value and can break that animation.

### Dependency baseline

`npm install`/`npm audit` reports 11 vulnerabilities: 1 low, 1 moderate, and 9 high. Affected packages include Babel, AJV, brace-expansion, flatted, js-yaml, minimatch, nanoid, picomatch, PostCSS, Rollup, and Vite. `npm audit fix` was deliberately not run during this baseline.

## Existing tests and quality controls

| Control | Status |
| --- | --- |
| ESLint | Configured and passing |
| Type checking | No `type-check` script, TypeScript config, Flow, or PropTypes validation. `@types/react` packages are installed but source is JavaScript. |
| Unit tests | None |
| Component tests | None |
| Integration tests | None |
| End-to-end tests | None |
| Accessibility tests | None |
| Link tests | None |
| Visual regression | None |
| CI workflow | None found |
| Production build | Passing |

## Baseline command results

| Command | Result |
| --- | --- |
| `npm install` | Passed; packages already up to date; audited 302 packages; reported 11 vulnerabilities |
| `npm run` | Confirmed scripts: dev, build, lint, preview, predeploy, deploy |
| `npm run lint` | Passed with no ESLint findings |
| `npm run type-check --if-present` | No script exists; no type-check task ran |
| `npm run test --if-present` | No script exists; no test task ran |
| `npm run build` | Passed with Vite 7.3.1; 2,147 modules transformed |
| `npm audit` | Exited 1 due to 11 known vulnerabilities; no fix applied |
| `curl` production header/index/asset checks | Homepage and thank-you returned 200; archived JS returned 200; current working-tree JS filename returned 404 |

Production output from the baseline build:

- `dist/index.html`: 0.48 kB, 0.31 kB gzip
- main CSS: 60.08 kB, 9.36 kB gzip
- main JavaScript: 474.27 kB, 138.60 kB gzip
- generated `dist/`: approximately 2.3 MB including copied public assets
- warning: Browserslist/caniuse-lite data is eight months old

## Files likely to change in later phases

### Architecture and deployment

- `package.json`
- `package-lock.json`
- `vite.config.js`
- `index.html`
- `public/thank-you.html`
- new hosting/CI configuration after the actual platform is confirmed

### Measurement, SEO, and compliance

- `index.html`
- `src/main.jsx` or a new analytics bootstrap/helper
- `src/App.jsx`
- `src/config/site.js`
- new `public/robots.txt`, sitemap, legal pages, consent components, and structured-data helpers

### Conversion and forms

- `src/components/HeroWithForm.jsx`
- `src/components/hero/HeroForm.jsx`
- `src/components/ContactForm.jsx`
- `src/components/StickyHeader.jsx`
- `src/components/UrgencyBanner.jsx`
- `src/components/WhatsAppFAB.jsx`
- `src/components/DrayaAISection.jsx`
- a new shared form/API/attribution module

### Proof and content governance

- `src/components/LiveActivityTicker.jsx`
- `src/components/SocialProofPopup.jsx`
- `src/components/Stats.jsx`
- `src/components/AchievementBadges.jsx`
- `src/components/TrustedBrands.jsx`
- `src/components/ClientLogosMarquee.jsx`
- `src/components/RealClientDashboards.jsx`
- `src/components/ROICalculator.jsx`
- `src/components/CaseStudies.jsx`
- `src/components/Testimonials.jsx`
- `src/components/MeetTheExpert.jsx`
- `src/components/WhyChooseUs.jsx`
- `src/components/FAQ.jsx`
- new centralized, evidence-linked content/data files

### Design system, accessibility, and performance

- `src/index.css`
- `tailwind.config.js`
- `src/constants/index.js`
- shared section, button, card, and CTA components
- hero/world-map assets and below-the-fold loading boundaries

### Quality controls

- new unit/component test configuration
- new end-to-end and accessibility tests
- new CI workflow

## Recommended implementation sequence

1. **Confirm production source of truth.** Identify the actual host, deployment workflow, production branch/commit, domain configuration, and whether the working-tree Draya changes are intended for release.
2. **Create a claim and brand evidence register.** Decide whether the customer-facing brand is Digital Universe Pro, ScaleAmazon, or a product/brand hierarchy. Supply evidence and approved scope for every metric, certification, testimonial, logo, screenshot, urgency offer, and case study.
3. **Resolve legal and privacy requirements.** Provide approved Privacy, Terms, Cookie, consent, and retention language before instrumenting or redesigning forms.
4. **Define measurement.** Select GA4/GTM or another stack, consent requirements, conversion definitions, ad pixels, event taxonomy, attribution fields, and reporting ownership.
5. **Harden lead capture.** Select an owned API/CRM destination, server-side validation, spam controls, source/UTM capture, error handling, thank-you behavior, and notification/SLA monitoring.
6. **Fix current functional defects.** Replace Draya/legal placeholders, correct deployment redirects, repair dead controls, remove false affordances, and synchronize static/configured contact data.
7. **Establish SEO foundations.** Add production metadata, canonical/robots/sitemap/structured data, noindex thank-you behavior, and decide whether to prerender the landing page.
8. **Add regression coverage.** Test both forms, redirect paths, CTA destinations, calculator math, legal/external links, mobile behavior, accessibility, and a production build in CI.
9. **Address dependencies and performance.** Update vulnerable build dependencies safely, refresh Browserslist data, reduce perpetual motion, self-host critical assets, and split below-the-fold code where useful.
10. **Begin visual/conversion enhancements.** Only after trustworthy proof, measurement, lead delivery, and compliance foundations are in place should message hierarchy, CTA design, section order, and experiments change.

## Information required from the site owner

1. Who owns the current Apache/GoDaddy-style hosting account, and how is production uploaded from this repository?
2. Which branch, commit, or artifact is currently live?
3. Is the public brand architecture Digital Universe Pro → ScaleAmazon/Draya AI, or should one brand replace the others?
4. Is the current uncommitted Draya work approved, and what is its real website URL and WhatsApp number?
5. What are the approved Privacy Policy, Terms, Cookie Policy, company/legal entity, address, and data-retention terms?
6. Which lead destination should replace or validate FormSubmit/personal Gmail: CRM, email platform, webhook, or owned backend?
7. Which analytics/tag-manager and advertising pixels are required, and which regions/consent rules apply?
8. Which revenue, seller, brand, ad-spend, success-rate, award, certification, case-study, testimonial, dashboard, and urgency claims have evidence and permission for public use?
9. Are the current Amazon SPN URLs and social profiles final, especially the generic LinkedIn feed URL?
10. What is the primary conversion: free audit form, consultation form, WhatsApp, phone call, or Draya cross-sell?
