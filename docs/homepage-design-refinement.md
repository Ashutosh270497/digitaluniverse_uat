# Homepage design refinement — 25 September 2026

The business supplied `Legacy_UI.png` and `UI_1.png` and requested a cohesive, attractive design with a more natural calculator/FAQ sequence. The legacy page is a composition reference; it does not replace the current service catalogue, supplied assets or working features.

## Design references

- [Arolax on ThemeForest](https://themeforest.net/item/arolax-creative-digital-agency-theme/53547630): dark/light agency layout combinations, clear typography and responsive page sections.
- [Arolax demo catalogue](https://crowdytheme-demo.com/wp/arolax-preview/): marketing, digital agency and AI service presentation references.
- [Yellow/black design reference on Pinterest](https://in.pinterest.com/pin/436286282671788477/): restrained yellow, white and dark surfaces that keep attention on the content.

These references informed the design direction. The implementation is original React/CSS using existing assets; no paid template, template code or external reference artwork was copied into the site.

## Page sequence

Hero and enquiry → Amazon credentials → client brands and founder figures → Amazon services → AI services → sales snapshots → growth calculator → process → founder → testimonials → global coverage → FAQ → final enquiry → footer.

The calculator now follows account snapshots, where visitors can explore their own scenario. A link connects the two sections. FAQs answer final questions after the team and marketplace information, immediately before the closing enquiry panel.

## Visual changes

- Unified the client-logo and performance area into a quieter white proof section, with clearer metric rules and supporting badges.
- Highlighted the hero's existing target-audience phrase in company yellow while preserving its heading text and experiment support.
- Added a shared split-heading pattern, consistent spacing, larger section titles and warm-white surfaces.
- Distinguished Amazon and AI offerings as the two service sections. Amazon cards have numbered icons and a yellow featured card; AI cards retain all six services and capabilities with tighter spacing.
- Refined the sales snapshot frames and linked them to the calculator without altering any supplied screenshot.
- Turned the process into four numbered cards. Added a yellow portrait accent, founder principles and more balanced testimonial cards.
- Simplified the map section background while preserving all interaction controls.
- Rebuilt the FAQ as a two-column introduction/contact panel and accessible accordion. Added AI-service and calculator questions; the generated FAQ schema contains the same eight questions.
- Added a substantial yellow closing panel with separate Amazon audit and AI project actions. Contact URLs, focus behavior and analytics remain connected to the existing flows.

Homepage presentation lives in `src/pages/home/home.css`, scoped to `.home-page` and its sections. Existing feature CSS continues to own the calculator, AI component internals and map behavior. Shared tokens and contact configuration remain centralized.

## Verification

- `npm run check`: lint, type checking, 121 tests, production build and SEO checks for 14 HTML entries passed.
- Responsive audit: 320, 360, 390, 768, 1024, 1366 and 1440 px passed, including labels, overflow, disclosures, source-image dialogs and calculator loading.
- Integration, AI enquiry, calculator and marketplace-map browser audits passed. Lead delivery was simulated; no enquiry was sent to a live destination.
- All eight FAQ accordions were opened at 320, 390, 768 and 1440 px; one answer stays open at a time and the layout remains within the viewport. DOM order confirms snapshots → calculator → process and FAQ → final enquiry.
- Local Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.3 seconds, TBT 0 ms, CLS 0. These are lab results for the local production preview.
- Desktop and mobile screenshots were visually inspected. Full-page captures are `artifacts/audits/design-homepage-1440.png` and `design-homepage-390.png`; focused FAQ, services, process and closing-panel captures are alongside them.

## Review and release scope

The pre-change source is preserved in `artifacts/checkpoints/pre-design-refinement/source.tar.gz`. Generated screenshots and audit logs are under `artifacts/audits/`.

Changes are local. Production hosting, real lead delivery, and final legal identity/policy wording are still awaiting the business's previously deferred inputs. Visual and local technical checks do not confirm those deployment-dependent steps. No commit, push or deployment is part of this update.
