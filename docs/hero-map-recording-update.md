# Hero and map motion — 26 September 2026

Reference: the owner's 36.8-second screen recording dated 25 September, 11:49 PM.
The requested changes cover the hero wording/typing behavior and map animation.

The hero starts with **Struggling to Scale?**, followed by **Let Us Help You** and
these messages in sequence:

1. Scale Your Amazon Business!
2. Maximize Your ROI!
3. Dominate Your Category!
4. Turn Products into Bestsellers!

The initial message is complete. After a reading pause, its ending deletes and
the next ending types in, matching the reference. A layout grid reserves space
for every message at the current screen width. The form does not jump while text
changes. One stable accessible H1 and the static SEO entry share the same copy.
Screen readers do not receive repeated character announcements. The existing
optional CRO treatment still renders its own static headline.

The owner requested removal of the hero pause button. The hero now cycles
automatically, holds each complete message for five seconds, types at 100 ms per
character, deletes at 50 ms per character, and waits 400 ms between messages.
Reduced-motion preferences show complete static text; offscreen/hidden-page
activity pauses the timer. The map retains its separate animation controls.

The existing world map, three regions, projection, markers, zoom/pan behavior,
service panel and all nine SPN links remain. Connections now have continuous
moving dashes and travelling light points, and all region markers have staggered
pulses. Pause map animation freezes the effects; the existing region tour remains
optional. Motion stops offscreen/in hidden tabs and is disabled for reduced
motion. No new map library, external data source or API key is required. The
motion is illustrative, not a real-time sales/shipping feed.

The reference's older performance figures, urgency banner, contact form and
additional coverage claims were outside this change. Current approved metrics
and form behavior remain in use.

## Verification

```bash
npm run check
# Run against the production preview in a separate terminal:
npm run hero:verify
npm run coverage:verify
npm run responsive:verify
npm run integration:verify
```

The hero browser audit checks all four messages, stable heading dimensions,
longer reading pauses, absence of the removed button, offscreen suspension and reduced-motion behavior across
five widths. The map audit checks physical signal movement, continued motion
beyond the previous four-second limit, freeze/resume, offscreen suspension,
region selection, nine directory links, pan, zoom, keyboard controls and tour.
GitHub CI now includes the hero suite alongside the existing browser suites.

Logs and screenshots are stored under ignored `artifacts/audits/`. Vercel/GoDaddy
deployment preparation remains in place. No push or deployment is included.

Verified locally: 131 tests, lint/types, production build, 14 SEO entries and
deployment checks passed. All four browser suites above passed, including seven
responsive widths and five hero/map configurations. No browser errors were reported.

After this update, mobile Lighthouse scored 97 performance and 100 for
accessibility, best practices and SEO (LCP 2.4 s, TBT 0 ms, CLS 0). This is a
local preview measurement; the report is `artifacts/audits/lighthouse-recording-mobile.json`.
