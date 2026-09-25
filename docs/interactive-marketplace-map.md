# Interactive marketplace explorer — 25 September 2026

The former map only displayed focusable region labels; its optional WebGL layer changed the appearance without providing a useful selection journey. The replacement is an interactive vector map with one shared region selection driving the visual, navigation and details panel.

## Visitor interactions

- Select North America, Europe or Asia using a map marker or a region button. The camera focuses the region, highlights its marker and updates its service summary.
- Open the three matching Amazon SPN links: USA for North America, UK for Europe, and India for Asia. These use the existing central URL configuration, including the correct `sellFrom` and `sellIn` values.
- Zoom in/out, drag the zoomed map, or reset to the world view. Keyboard users can select markers with Enter/Space and use arrow keys, plus/minus, Home or Escape when the map itself is focused.
- Start or pause a guided region tour. Manual selection, camera interaction or keyboard focus elsewhere in the explorer pauses the tour. The tour and ambient animation suspend off screen and when the document is hidden. Reduced-motion users get immediate transitions and no automatic tour control.
- Use the expansion enquiry link to reach the existing contact form directly.

Touch users retain vertical page scrolling and browser pinch zoom; map zoom controls and horizontal drag provide map navigation without trapping page gestures. The region buttons and details panel remain available if the map module cannot render.

## Design references

The design uses the site’s yellow/charcoal styling, regional emphasis, subtle graticule lines, connected routes and a contextual panel. References consulted:

- [Stripe: To design and develop an interactive globe](https://stripe.com/blog/globe) — connected-world presentation and progressive discovery.
- [Mapbox: Fly to a location](https://docs.mapbox.com/mapbox-gl-js/example/flyto/) — animated focus after selection.
- [Mapbox: Create a hover effect](https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/) — clear feedback around geographic selection.

No third-party artwork or application code was copied. The implementation continues using the project's existing `world-atlas`, `d3-geo` and `topojson-client` data/projection pipeline; it needs no map API token or remote tile requests.

## Ownership and performance

- `src/content/marketplaceCoverage.ts`: approved regions, representative coordinates, panel content and directory mappings.
- `src/features/global-coverage/GlobalCoverageSection.jsx`: lazy loading, region state, tour lifecycle, accessible region controls and panel.
- `GlobalCoverageVisual.jsx`: mouse/touch/keyboard camera interaction and selectable markers.
- `StaticCoverageMap.jsx`: vector world, regional illumination and connection animation.
- `mapViewport.js`: bounded pan/zoom/focus math, covered by behavioral unit tests.
- `coverage.css`: map-specific presentation, camera transitions and motion preferences.

The unused WebGL renderer and its `three` / `@react-three/fiber` dependencies were removed. The prior 926 KB WebGL chunk is no longer built. The vector map module remains lazy-loaded near the viewport. Following the supplied screen recording, connection dashes, travelling light points and region pulses now loop while the map is visible. A separate Pause map animation control freezes this ambient motion; it also pauses a running tour. Animation suspends off screen, in hidden tabs, and for reduced-motion preferences. The region tour still starts only on request. These effects illustrate marketplace connections; they are not a live sales or shipment data feed.

Regions describe founder-reported marketplace support. Coordinates are representative anchors, not offices; the connected lines are not shipping routes. The directory country is named separately from its broader region. No country count or market-specific revenue figures have been invented.

## Verification

Run `npm run check`, `npm run coverage:verify`, and `npm run responsive:verify` against the production preview. The coverage audit verifies real DOM state changes, correct regional URLs, native keyboard selection, pointer pan, bounded zoom/reset, tour progression/pause, continuous route motion beyond four seconds, actual light-point movement, manual/offscreen pause, layout and operation without WebGL.

Review screenshots and current check output are saved under `artifacts/audits/interactive-map-*`. Source before this change is backed up under `artifacts/checkpoints/pre-interactive-map/`. This change has not been deployed.

Completed checks:

- Lint, type-check, 111 tests and a production build; SEO verification passed for all 14 HTML entries.
- Region selection, all nine URLs, keyboard controls, pointer drag, tour advancement and offscreen pause passed at 1440, 390, 320 and 768 px, plus reduced-motion / WebGL-disabled operation at 1024 px.
- The full-page responsive audit passed all seven widths (320–1440 px); route, navigation and simulated form-delivery integration checks passed.
- Emulated touch at 390 px confirmed horizontal map panning and continued vertical page scrolling. Real-device Safari testing remains a separate launch check.
- Fresh local mobile Lighthouse: performance 98, accessibility 100, best practices 100 and SEO 100; LCP 2.3 s, TBT 0 ms, CLS 0. These are lab measurements, not deployed field results. The report is `artifacts/audits/lighthouse-interactive-map-mobile.json`.
