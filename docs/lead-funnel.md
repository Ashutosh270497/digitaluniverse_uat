# Canonical free Amazon audit funnel

## Current lead destination

Lead delivery is **not configured** in the repository. The previous browser-side
FormSubmit/personal-inbox delivery has been removed.

The server adapter at `api/leads.js` sends each validated lead to every
configured channel at the same time:

| Channel | Provider | Variables |
| --- | --- | --- |
| Email alert | [Resend](https://resend.com) email API (free plan: 3,000 emails/month, 100/day) | `RESEND_API_KEY`, `LEAD_EMAIL_TO`, optional `LEAD_EMAIL_FROM` |
| CRM/automation | Any approved HTTPS webhook that accepts the JSON payload below | `LEAD_WEBHOOK_URL`, optional `LEAD_WEBHOOK_BEARER_TOKEN` |

The form shows success when at least one channel confirms delivery. A channel
that fails is logged by name and HTTP status only, without lead values. When no
channel is configured, the API returns HTTP 503 and the form displays a delivery
error; it never displays false success.

### Email alert setup (Resend)

1. Create a free Resend account **using the inbox that should receive leads**.
2. Create an API key and store it in Vercel as `RESEND_API_KEY`.
3. Set `LEAD_EMAIL_TO` to that same inbox address.

Without a verified domain, Resend sends from `onboarding@resend.dev` and only to
the Resend account's own email address; any other recipient is rejected with
HTTP 403. To send from an address such as `leads@digitaluniversepro.co`, or to
other recipients, verify the domain in Resend (DNS records in GoDaddy) and set
`LEAD_EMAIL_FROM`, for example `Digital Universe <leads@digitaluniversepro.co>`.
Email leads set Reply-To to the visitor's address. Leads that chose WhatsApp
include “Chat on WhatsApp” (`wa.me`) and “Call” buttons.

Alerts are branded, table-based HTML emails with a plain-text version
(`server/leads/leadEmails.js`, no extra dependencies). The subject and preview
line carry the name, a compact revenue band and the preferred channel. Every
visitor-supplied value is HTML-escaped. The header logo loads from the site that
received the form (`/brand/digital-universe-logo.jpg`).

### Visitor confirmation email (optional)

Leads that chose email can also receive a branded confirmation. It is sent only
after the business alert is confirmed, never for WhatsApp leads, and only when
`LEAD_CONFIRMATION_FROM` is set to a sender on a domain verified in Resend (for
example `Digital Universe <hello@mail.digitaluniversepro.co>`). Replies go to
`LEAD_CONFIRMATION_REPLY_TO` (default `support@digitaluniversepro.co`). A failed
confirmation is logged and never fails the lead.

### WhatsApp

Automatic WhatsApp lead alerts are deferred. The site's WhatsApp buttons open a
chat with the business number and need no server configuration.

The selected deployment sequence is Vercel for founder review, followed by GoDaddy Apache for the public website. Static Apache hosting cannot execute `api/leads.js`. The supported arrangements are:

1. deploy the website and `api/leads.js` to a serverless-capable host, using the
   default same-origin `/api/leads` browser endpoint; or
2. deploy the API separately and set `VITE_LEAD_API_URL` to its public HTTPS URL.

See [deployment steps](deployment.md) for Vercel and GoDaddy setup.

## Required environment variables

| Variable | Runtime | Requirement |
| --- | --- | --- |
| `RESEND_API_KEY` | Server only | Email alert. Resend API key. Never expose it with a `VITE_` prefix. |
| `LEAD_EMAIL_TO` | Server only | Email alert. Comma-separated recipients; without a verified domain, only the Resend account's own email. |
| `LEAD_EMAIL_FROM` | Server only | Optional. Sender on a Resend-verified domain. Defaults to `onboarding@resend.dev`. |
| `LEAD_CONFIRMATION_FROM` | Server only | Optional. Enables the visitor confirmation email; must be on a Resend-verified domain. |
| `LEAD_CONFIRMATION_REPLY_TO` | Server only | Optional. Reply-To for the visitor confirmation. Defaults to `support@digitaluniversepro.co`. |
| `LEAD_WEBHOOK_URL` | Server only | Optional CRM/automation channel. Approved HTTPS webhook destination. |
| `LEAD_ALLOWED_ORIGINS` | Server only | Required for a separate API origin. Comma-separated website origins permitted to POST. |
| `VITE_LEAD_API_URL` | Browser/public | Required on static hosting or when the API uses another origin. Omit for a same-origin `/api/leads` deployment. |
| `VITE_BOOKING_CALENDAR_URL` | Browser/public | Required before the success screen can offer calendar booking. Must be the verified public HTTPS calendar URL. |
| `LEAD_WEBHOOK_BEARER_TOKEN` | Server only | Optional, depending on destination authentication. Never expose it with a `VITE_` prefix. |
| `LEAD_RATE_LIMIT_SALT` | Server only | Recommended stable random value used to hash rate-limit IP keys. An ephemeral process salt is used when absent. |
| `LEAD_RATE_LIMIT_MAX` | Server only | Optional. Defaults to 5 attempts. |
| `LEAD_RATE_LIMIT_WINDOW_MS` | Server only | Optional. Defaults to 600000 milliseconds. |
| `LEAD_WEBHOOK_TIMEOUT_MS` | Server only | Optional. Timeout shared by all delivery channels. Defaults to 8000 milliseconds. |

Use `.env.example` as the key inventory. Real values belong in the deployment
platform's secret/environment settings or an ignored local environment file.

## Lead payload

The webhook channel receives a JSON POST containing the fields below. Email alerts contain the name, contact, revenue label and receipt time (IST) as readable text:

- `source`
- `stage` (`lead`)
- `receivedAt`
- `leadId` (for example `DU-20261014-7K3P`: IST date plus a random suffix)
- `formLocation` (`hero`, `contact_page` or `unspecified`)
- `name`
- `contactMethod` (`email` or `whatsapp`)
- `contact`
- `monthlyAmazonRevenueRange`
- `monthlyAmazonRevenueCurrency` (`USD`, `INR` or `GBP`)
- `monthlyAmazonRevenueRangeLabel` (the localized range shown in the form)

Optional Step 2 answers arrive as a separate POST with `stage: "details"`, the
same `leadId`, the visitor's name and contact, `storeUrl`, `marketplaces`,
`sellerType`, `monthlyAdSpendRange`/`Currency`/`RangeLabel`, `challenges` and
`notes`. The email channel sends a follow-up alert titled
“Audit details added: <name> (<lead ID>)”.

The spam honeypot, form-start timestamp, rate-limit IP key, and authorization token
are never forwarded. The application contains no lead-value logging.

## Validation and abuse controls

- The client and server use the same field schema.
- Email and WhatsApp formats are validated according to the selected contact method.
- Step 1 does not collect an Amazon URL; retired `amazonUrl` payload values are ignored and never forwarded. The store link or ASIN is an optional Step 2 answer.
- Step 2 requires a valid lead ID, the Step 1 identity and at least one answer. Marketplaces, seller type, challenges and the ad-spend range must come from the published lists; the store link is limited to 300 characters and notes to 1,000.
- The WhatsApp number is entered with a country-code picker (default +91); a number typed with its own `+` code is used as typed.
- Currency must be explicitly supplied as USD, INR or GBP. Revenue must match a range for that currency.
- USD/GBP bands use 10,000, 50,000 and 200,000 boundaries; INR bands use ₹1,00,000, ₹5,00,000 and ₹20,00,000. These are qualification bands, not live exchange-rate conversions.
- Switching currency clears a monetary range so it cannot silently acquire a different meaning. The non-monetary “Not selling on Amazon yet” answer is retained.
- The approved revenue-field experiment omits both currency controls and the range; no revenue fields are forwarded when no range is supplied.
- Server requests must use POST JSON objects and remain at or below 10,000 UTF-8 bytes.
- Lead responses are never cached. HTTP redirects are not followed when sending personal data.
- Browser requests time out after 15 seconds; delivery channels share an 8-second default timeout. No automatic retries send duplicate leads. A timeout cannot establish whether the destination received the request.
- Cross-origin requests are restricted by `LEAD_ALLOWED_ORIGINS`.
- A hidden honeypot and minimum completion time reject basic automated submissions.
- IPs are hashed before an in-memory fixed-window rate limit is applied.

The in-memory limiter is basic protection for the dependency-free current stack.
For a horizontally scaled/serverless production deployment, replace its storage
with a shared rate-limit service before high-volume traffic.

## Success flow

1. The browser validates name, contact method/contact, revenue currency and the matching revenue range.
2. The browser sends JSON to the lead API using POST.
3. The server repeats validation and applies origin, spam, size, and rate-limit checks.
4. The server assigns a lead ID and sends the normalized lead to every configured channel (email, webhook) in parallel.
5. Only an acknowledged response from at least one channel produces `{ "delivered": true, "leadId": "…" }`.
6. The success screen celebrates (CSS animation plus a short `canvas-confetti` burst, loaded only on success and skipped for reduced motion), greets the visitor by first name and lists what happens next.
7. When a lead ID was returned, the visitor can open the optional Step 2 or continue on WhatsApp with a pre-filled message that includes the lead ID.
8. Sending or skipping Step 2 ends on an “All set” screen that plays back the shared details. A booking action appears there only when `VITE_BOOKING_CALENDAR_URL` is a valid HTTPS URL.

## Failure flow

- Client validation keeps the form visible, associates errors with fields, and focuses the first invalid field.
- Server validation returns HTTP 422 with field errors.
- Rate limiting returns HTTP 429 with `Retry-After`.
- Missing destination configuration returns HTTP 503.
- Network, timeout, or webhook rejection returns a visible failure and never switches the UI to success.
- Every failure state offers WhatsApp as a secondary route.

## Manual end-to-end test

1. Complete the Resend setup above (and obtain any CRM/webhook URL and the real booking-calendar URL from the owner).
2. Configure server variables in a staging serverless/API environment. Do not put the webhook token in a `VITE_` variable.
3. If the API is separate, set `VITE_LEAD_API_URL` and add the website origin to `LEAD_ALLOWED_ORIGINS`.
4. Build and serve the website against that staging API.
5. Submit with every field empty; confirm errors for Name, Contact and Revenue range (USD is initially selected) and focus on Name.
6. Enter an invalid work email; confirm the contact error remains associated with the field.
7. Switch between USD, INR and GBP; confirm the options update, a monetary selection clears, and each submitted currency/range pair reaches the email alert with its localized label.
8. Select WhatsApp, enter a valid number with country code, and submit with the Enter key.
9. Temporarily set invalid keys for every channel; confirm the form shows failure and no receipt confirmation, and that Vercel logs name each failed channel.
10. Restore the keys and submit a unique valid lead; confirm exactly one email arrives and the success screen appears.
11. Confirm the real calendar link and WhatsApp link open the intended destinations.
12. Submit more than the configured limit from one test IP; confirm HTTP 429 and no upstream delivery.
13. Test Privacy Policy and Terms links with mouse and keyboard.
