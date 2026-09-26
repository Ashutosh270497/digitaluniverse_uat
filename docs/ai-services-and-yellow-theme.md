# AI services and yellow theme — 25 September 2026

Implements the six services and visual direction supplied in the three AI reference screenshots. The six services now live on the standalone `/ai-services` page, reachable from the main navigation, hero, footer and About page. The homepage remains focused on Amazon services. Old homepage AI fragment URLs redirect to the matching fragment on the new page.

## Content and design

- Custom AI Agents
- AI-Powered SaaS Development
- RAG & Knowledge Systems
- Workflow Automation
- AI Strategy & Consulting
- MLOps & AI Infrastructure

Each service has an introduction, five capabilities and a project enquiry link. Reference copy was edited for clarity, including removing the repeated MVP bullet and describing RAG as retrieval from business information. The founder’s existing performance figures remain under an Amazon-specific heading; no AI project results were invented.

The shared palette uses bright company yellow (`#ffd400`), warm charcoal (`#17180f`), pale yellow surfaces and darker gold text on light backgrounds. Headers, buttons, forms, footer, internal pages and marketplace explorer use this direction. The AI introduction has an original code-native circuit illustration with Automate, Analyze, Optimize and Scale nodes. It adds no image downloads or third-party dependencies.

Cards use three columns on desktop, two on tablets and one on mobile. CSS subgrid aligns titles, descriptions, capability lists and calls to action across each row, with a flex layout fallback. Keyboard focus remains visible and the illustration is decorative for assistive technology.

## Project enquiries

Service links open `/contact?service=<service-id>#ai-project`. The bootstrap captures only the requested service before the existing analytics initialization removes URL queries. The contact component validates that value against the service catalogue and focuses the selector. Unknown values fall back to “Help me choose the right AI service.”

Changing the selection updates WhatsApp and email links with the chosen service. Visitors can edit their message before sending; the website itself does not send a message or submit an AI enquiry to the Amazon audit API. Contact details come from `src/config/site.js`.

## Maintenance

| Responsibility | File |
| --- | --- |
| Service copy and capabilities | `src/content/aiServices.ts` |
| Standalone page | `src/pages/ai-services/AIServicesPage.jsx` |
| Illustration and card styles | `src/features/ai-services/AICapabilitiesVisual.jsx`, `ai-services.css` |
| Contact selector and link helpers | `src/features/ai-services/AIProjectInquiry.jsx`, `inquiry.js` |
| Brand colors | `tailwind.config.js` |
| Navigation and route metadata | `src/config/navigation.js`, `seo.js` |

## Verification

- `npm run check`: lint, type checks, 114 tests, production build and SEO verification for 14 HTML entries.
- `npm run ai:verify`: six cards, row alignment and yellow palette at 320, 390, 768, 1024 and 1440 px; all six service enquiry selections; selector updates; unknown-service fallback; contact overflow checks; URL cleanup; no uncaught browser errors.
- `npm run responsive:verify`: existing homepage behavior and overflow checks at seven widths from 320 to 1440 px.
- `npm run integration:verify`: routes, links, navigation, keyboard/pointer interactions, audit form validation and simulated lead delivery.
- `npm run coverage:verify`: region selection, directory links, zoom/reset, keyboard controls and reduced-motion behavior.

Local Lighthouse mobile results: performance 97, accessibility 100, best practices 100 and SEO 100; LCP 2.3 seconds, total blocking time 0 ms and CLS 0. The contact page also scored 100 for accessibility. These are local lab measurements, not deployed-host performance guarantees.

Screenshots and logs are saved in `artifacts/audits/`, including `ai-services-1440.png`, `ai-services-390.png` and `ai-project-contact-390.png`. The pre-change source backup is `artifacts/checkpoints/pre-ai-services/source.tar.gz`.

The previously deferred hosting platform, Amazon lead destination and final legal details remain outstanding. No deployment, commit or push was performed as part of this update.
