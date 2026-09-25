# Privacy-aware conversion analytics

## Current configuration status

No production analytics provider IDs were supplied, so all provider environment variables are blank, the preference banner remains hidden, and the production build loads no analytics tags by default.

Once at least one valid provider ID is configured, the implementation uses basic consent mode: provider scripts are not inserted and no event is transmitted until the visitor chooses **Accept analytics**. Declining clears the in-memory event queue and session attribution. The consent choice itself is stored in local storage so the site can remember it; UTM attribution is written to session storage only after analytics consent is granted.

The active cookie-policy route still contains an unpublished-policy notice. Legal approval, the provider/data-processor list, retention information, and regional consent language remain required before deployment with production IDs.

## Environment variables

All IDs are public browser configuration, but none are hard-coded:

| Variable | Purpose |
| --- | --- |
| `VITE_GA4_MEASUREMENT_ID` | GA4 web-stream measurement ID, for example the supplied `G-...` value |
| `VITE_CLARITY_PROJECT_ID` | Optional Microsoft Clarity project ID |
| `VITE_META_PIXEL_ID` | Optional Meta Pixel ID |
| `VITE_LINKEDIN_PARTNER_ID` | Optional LinkedIn Insight Tag partner ID |
| `VITE_LINKEDIN_CONVERSION_IDS_JSON` | Optional JSON map from event names to supplied LinkedIn conversion IDs |
| `VITE_ANALYTICS_DEBUG` | `true` enables sanitized console logging; development logs by default unless explicitly set to `false`, production does not |

Example LinkedIn mapping shape, using real IDs supplied by the account owner:

```json
{
  "audit_form_success": "CONVERSION_ID",
  "calendar_booked": "CONVERSION_ID"
}
```

LinkedIn events without a configured conversion ID are deliberately not dispatched as conversions.

## Event catalogue

| Event | Meaning | Typical context |
| --- | --- | --- |
| `page_view` | Initial page view or a new SPA pathname | `page_path`, `page_title`, device, UTM |
| `primary_cta_click` | Canonical free-audit CTA activated | CTA label/location, optional service |
| `secondary_cta_click` | Verified-case-studies CTA activated | CTA label/location |
| `audit_form_start` | First focus or submit interaction with an audit form | Form location |
| `audit_form_validation_error` | Client validation blocks submission | Form location, field-name list, error count |
| `audit_form_submit` | A valid form begins the secure POST request | Form location |
| `audit_form_success` | The lead API confirms downstream delivery | Form location |
| `audit_form_failure` | The lead API, network, configuration, or rate limit prevents confirmed delivery | Sanitized failure category, HTTP status, field-name list |
| `calendar_open` | The configured calendar link is opened after confirmed lead delivery | Form/CTA location, configured-calendar label |
| `calendar_booked` | A supported calendar integration confirms a completed booking | Calendar provider and non-sensitive location context |
| `whatsapp_click` | A WhatsApp contact link is activated | CTA location |
| `case_study_view` | A published case-study detail page renders | Case-study identifier |
| `service_view` | A service-intent page renders | Typed service identifier |
| `faq_open` | A closed FAQ answer is opened | FAQ identifier |
| `email_click` | A `mailto:` contact link is activated | CTA location |
| `phone_click` | A `tel:` contact link is activated | CTA location |

## Shared non-sensitive context

The abstraction accepts only this context allowlist:

- `page_path` without query parameters;
- `page_title`;
- CTA label and location;
- typed service ID;
- typed case-study ID;
- device category derived only from viewport width;
- form location;
- FAQ ID;
- validation field names and counts, never field values;
- a controlled failure category and HTTP status;
- configured calendar label;
- active `experiment_id` and `experiment_variant` from the session-stable CRO assignment;
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term`.

Unknown keys are discarded. Names, emails, telephone numbers, messages, contact values, Amazon store/ASIN URLs, and generic URLs are not allowlisted and therefore cannot be sent through the analytics abstraction. The lead form also has `data-clarity-mask="true"`, and Meta automatic configuration is disabled.

Experiment assignment is inactive unless both CRO approval and one active experiment ID
are configured. Eligible assignments persist in session storage so funnel events retain
one variant during the visit. Internal, automation, test and development-preview traffic
does not receive experiment analytics context. See `docs/cro-experiments.md`.

Landing-page UTM parameters are captured in memory, the browser query string is then removed before any third-party tag can load, and the attribution is persisted to session storage only after consent. That stored attribution is attached to later funnel events, including form success and calendar events.

## Consent and provider behaviour

- **Unknown:** provider scripts are absent; sanitized events may wait in a maximum 50-event in-memory queue.
- **Granted:** configured providers load once, the attribution is stored for the browser session, and queued events dispatch once.
- **Denied:** queued events and stored attribution are removed; future events are blocked.
- **Changed later:** the footer’s **Cookie settings** button reopens the preference control. GA4, Clarity, and Meta receive their supported consent-revocation calls; the central dispatcher stops all provider events.
- **Automated tests:** test mode disables provider loading, event dispatch, and development logging. Unit tests use fake in-memory providers when dispatch behaviour itself must be verified.

GA4 is configured with `send_page_view: false`; the application sends its own deduplicated `page_view` events. In the GA4 web stream, also disable the Enhanced Measurement option for “Page changes based on browser history events” to prevent GA4 from adding a second SPA page view.

## Calendar completion integration

Opening the configured calendar fires `calendar_open`. A successful booking cannot be inferred from opening an external tab.

If the approved booking platform supports a completion callback, call:

```js
import { trackCalendarBooked } from './src/analytics/index.js';

trackCalendarBooked({
  calendar_provider: 'approved-provider-name',
  cta_location: 'booking_callback',
  dedupeKey: 'provider-booking-reference',
});
```

The `dedupeKey` is used only inside the browser and is not part of the analytics payload. It must be an opaque booking reference, not an email address, telephone number, or message.

An embed can alternatively dispatch a browser event after verifying the platform callback:

```js
window.dispatchEvent(new CustomEvent('digital-universe:calendar-booked', {
  detail: {
    calendar_provider: 'approved-provider-name',
    cta_location: 'booking_callback',
    dedupeKey: 'opaque-booking-reference'
  }
}));
```

Do not fire `calendar_booked` from a calendar-link click or from an unverified redirect.

## Funnel definition

Measure the primary funnel as ordered, consented unique sessions:

1. **Landing:** `page_view` on `/` or a service-intent landing page, grouped by first-session UTM attribution.
2. **CTA:** first `primary_cta_click` in the same session.
3. **Form start:** first `audit_form_start` after that CTA.
4. **Form success:** `audit_form_success`; do not use `audit_form_submit` because failed delivery is not a lead.
5. **Calendar booking:** `calendar_booked` only when the approved calendar provides a confirmed completion callback.

Recommended rates:

- Landing → CTA = sessions with `primary_cta_click` / consented landing sessions.
- CTA → Form start = sessions with `audit_form_start` / sessions with `primary_cta_click`.
- Form start → Form success = sessions with `audit_form_success` / sessions with `audit_form_start`.
- Form success → Calendar booking = sessions with `calendar_booked` / sessions with `audit_form_success`.
- Landing → Calendar booking = sessions with `calendar_booked` / consented landing sessions.

Break down each rate by `page_path`, `device_category`, UTM fields, CTA location, and service. Treat visitors who decline analytics as outside the measurable analytics population rather than as non-converters.

## Validation checklist

1. Leave all provider IDs blank and confirm no requests go to Google, Microsoft, Meta, or LinkedIn.
2. Add test-property IDs locally, clear local/session storage, reload, and confirm no provider script appears before consent.
3. Decline analytics and confirm conversion interactions create no provider requests.
4. Accept analytics and verify one initial `page_view`, then test each event in the provider’s debug/realtime tooling.
5. Load a UTM-tagged URL, confirm the query is removed, submit the form successfully, and confirm the same UTM values appear on the success event.
6. Inspect event payloads and confirm no lead-field value appears.
7. Verify GA4 Enhanced Measurement history-based page changes are disabled if manual SPA page views are used.
8. Configure only approved LinkedIn conversion IDs and test browser/server deduplication if a server conversion API is added later.
