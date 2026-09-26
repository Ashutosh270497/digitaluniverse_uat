# Canonical free Amazon audit funnel

## Current lead destination

Lead delivery is **not configured** in the repository. The previous browser-side
FormSubmit/personal-inbox delivery has been removed.

The server adapter at `api/leads.js` sends validated leads to the HTTPS URL in
`LEAD_WEBHOOK_URL`. That value must be the CRM, owned webhook, or email-automation
endpoint approved by Digital Universe Pro. Until it is supplied, the API returns
HTTP 503 and the form displays a delivery error; it never displays false success.

The selected deployment sequence is Vercel for founder review, followed by GoDaddy Apache for the public website. Static Apache hosting cannot execute `api/leads.js`. The supported arrangements are:

1. deploy the website and `api/leads.js` to a serverless-capable host, using the
   default same-origin `/api/leads` browser endpoint; or
2. deploy the API separately and set `VITE_LEAD_API_URL` to its public HTTPS URL.

See [deployment steps](deployment.md) for Vercel and GoDaddy setup.

## Required environment variables

| Variable | Runtime | Requirement |
| --- | --- | --- |
| `LEAD_WEBHOOK_URL` | Server only | Required. Approved HTTPS CRM/webhook destination. |
| `LEAD_ALLOWED_ORIGINS` | Server only | Required for a separate API origin. Comma-separated website origins permitted to POST. |
| `VITE_LEAD_API_URL` | Browser/public | Required on static hosting or when the API uses another origin. Omit for a same-origin `/api/leads` deployment. |
| `VITE_BOOKING_CALENDAR_URL` | Browser/public | Required before the success screen can offer calendar booking. Must be the verified public HTTPS calendar URL. |
| `LEAD_WEBHOOK_BEARER_TOKEN` | Server only | Optional, depending on destination authentication. Never expose it with a `VITE_` prefix. |
| `LEAD_RATE_LIMIT_SALT` | Server only | Recommended stable random value used to hash rate-limit IP keys. An ephemeral process salt is used when absent. |
| `LEAD_RATE_LIMIT_MAX` | Server only | Optional. Defaults to 5 attempts. |
| `LEAD_RATE_LIMIT_WINDOW_MS` | Server only | Optional. Defaults to 600000 milliseconds. |
| `LEAD_WEBHOOK_TIMEOUT_MS` | Server only | Optional. Defaults to 8000 milliseconds. |

Use `.env.example` as the key inventory. Real values belong in the deployment
platform's secret/environment settings or an ignored local environment file.

## Lead payload

The approved destination receives a JSON POST containing:

- `source`
- `receivedAt`
- `name`
- `contactMethod` (`email` or `whatsapp`)
- `contact`
- `monthlyAmazonRevenueRange`
- `monthlyAmazonRevenueCurrency` (`USD`, `INR` or `GBP`)
- `monthlyAmazonRevenueRangeLabel` (the localized range shown in the form)

The spam honeypot, form-start timestamp, rate-limit IP key, and authorization token
are never forwarded. The application contains no lead-value logging.

## Validation and abuse controls

- The client and server use the same field schema.
- Email and WhatsApp formats are validated according to the selected contact method.
- The form no longer collects an Amazon URL. Retired `amazonUrl` payload values are ignored and never forwarded.
- Currency must be explicitly supplied as USD, INR or GBP. Revenue must match a range for that currency.
- USD/GBP bands use 10,000, 50,000 and 200,000 boundaries; INR bands use ₹1,00,000, ₹5,00,000 and ₹20,00,000. These are qualification bands, not live exchange-rate conversions.
- Switching currency clears a monetary range so it cannot silently acquire a different meaning. The non-monetary “Not selling on Amazon yet” answer is retained.
- The approved revenue-field experiment omits both currency controls and the range; no revenue fields are forwarded when no range is supplied.
- Server requests must use POST JSON objects and remain at or below 10,000 UTF-8 bytes.
- Lead responses are never cached. HTTP redirects are not followed when sending personal data.
- Browser requests time out after 15 seconds; the upstream webhook defaults to an 8-second timeout. No automatic retries send duplicate leads. A timeout cannot establish whether the destination received the request.
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
4. The server sends the normalized lead to the configured webhook.
5. Only an acknowledged upstream response produces `{ "delivered": true }`.
6. The form confirms receipt and explains that the team will review the submitted account details and contact the lead through the selected method.
7. A booking action appears only when `VITE_BOOKING_CALENDAR_URL` is a valid HTTPS URL.
8. WhatsApp remains available as a secondary action.

## Failure flow

- Client validation keeps the form visible, associates errors with fields, and focuses the first invalid field.
- Server validation returns HTTP 422 with field errors.
- Rate limiting returns HTTP 429 with `Retry-After`.
- Missing destination configuration returns HTTP 503.
- Network, timeout, or webhook rejection returns a visible failure and never switches the UI to success.
- Every failure state offers WhatsApp as a secondary route.

## Manual end-to-end test

1. Obtain the approved CRM/webhook URL and real booking-calendar URL from the owner.
2. Configure server variables in a staging serverless/API environment. Do not put the webhook token in a `VITE_` variable.
3. If the API is separate, set `VITE_LEAD_API_URL` and add the website origin to `LEAD_ALLOWED_ORIGINS`.
4. Build and serve the website against that staging API.
5. Submit with every field empty; confirm errors for Name, Contact and Revenue range (USD is initially selected) and focus on Name.
6. Enter an invalid work email; confirm the contact error remains associated with the field.
7. Switch between USD, INR and GBP; confirm the options update, a monetary selection clears, and each submitted currency/range pair reaches the webhook with its localized label.
8. Select WhatsApp, enter a valid number with country code, and submit with the Enter key.
9. Force the webhook to return an error; confirm the form shows failure and no receipt confirmation.
10. Restore the webhook and submit a unique valid lead; confirm the CRM receives exactly one JSON payload and the success screen appears.
11. Confirm the real calendar link and WhatsApp link open the intended destinations.
12. Submit more than the configured limit from one test IP; confirm HTTP 429 and no upstream delivery.
13. Test Privacy Policy and Terms links with mouse and keyboard.
