# Deployment: Vercel review, then GoDaddy

## 1. Push the source and review on Vercel

Commit the complete working tree, including the moved files, `package-lock.json`,
`vercel.json`, `.nvmrc`, `.github/`, and `.env.example`. Keep real environment
files, `node_modules/`, `dist/`, `.vercel/`, and `artifacts/` out of Git.

Before pushing:

```bash
nvm use
npm ci
npm run check
npm run security:check
git diff --check
```

Import the GitHub repository into Vercel:

| Setting | Value |
| --- | --- |
| Root directory | Repository root; do not select `src/` |
| Framework | Vite |
| Node.js | 22.x |
| Install command | `npm ci` |
| Build command | `npm run check` |
| Output directory | `dist` |

These settings are defined in `vercel.json` and `package.json`. Vercel deploys
`api/leads.js` as a Node function and serves the generated pages from `dist`.
Keep the GoDaddy domain and DNS unchanged during founder review. Use the Vercel
project URL. `*.vercel.app` responses carry `X-Robots-Tag: noindex, nofollow,
noarchive`; this discourages indexing but is not access control. Use Vercel's
deployment protection if the review must be private, with founder access enabled.

No environment variables are needed to review the UI, navigation, AI enquiry
links, map, or calculator. With no webhook configured, valid Amazon audit
submissions show a delivery error and offer WhatsApp. They cannot arrive in an
inbox or CRM yet. Do not present that state as a working lead integration.

For real audit delivery, set these in Vercel's environment settings, then redeploy:

| Variable | Value |
| --- | --- |
| `LEAD_WEBHOOK_URL` | Approved HTTPS CRM/webhook endpoint |
| `LEAD_WEBHOOK_BEARER_TOKEN` | Destination token, only if required |
| `LEAD_ALLOWED_ORIGINS` | `https://digitaluniversepro.co` |
| `LEAD_RATE_LIMIT_SALT` | A stable random server-only secret |
| `VITE_LEAD_API_URL` | Leave blank on Vercel: same-origin `/api/leads` |
| `VITE_BOOKING_CALENDAR_URL` | Optional approved HTTPS booking URL |

Set variables for the deployment environment actually used for review. Secrets
must never have a `VITE_` prefix. Analytics and experiments can remain disabled.
The API has basic in-memory rate limiting; use platform or shared rate limiting
before substantial public traffic because instances do not share counters.

## 2. Publish the approved website on GoDaddy

GoDaddy's static Apache hosting serves `dist`; it does **not** execute the Node
lead handler. Keep the lead API deployed on Vercel, using a stable project
production URL, and allow the GoDaddy origin with `LEAD_ALLOWED_ORIGINS`.
The public API deployment must accept unauthenticated website requests; a
protected Vercel preview URL cannot serve as the production lead endpoint.

Create an ignored `.env.production.local` containing the public API URL:

```dotenv
VITE_LEAD_API_URL=https://YOUR-PROJECT.vercel.app/api/leads
```

Replace `YOUR-PROJECT` with the real Vercel project hostname. Do not add webhook
secrets to this file for the static frontend. Then:

```bash
npm ci
npm run check
npm run security:check
```

Back up the existing GoDaddy website. Upload the **contents** of `dist/` into the
domain's document root, including the hidden `.htaccess`. Do not upload the
repository, server source, environment files, or `node_modules`.
Deploy only at the domain root; subdirectory hosting is not configured.

Confirm Apache permits the supplied rewrite, directory, and header directives.
The `.htaccess` handles HTTPS/non-www redirects, slashless page URLs, real 404s,
security headers, revalidated HTML, compression, and immutable hashed assets.
TLS must cover both `digitaluniversepro.co` and `www.digitaluniversepro.co`.
Keep the previous release available for rollback. If replacing an existing
release, retain its hashed assets temporarily so already-open pages can still
load their older lazy chunks. Clear any GoDaddy/CDN HTML cache after upload.

## 3. Verify the actual deployment

Check the homepage, a service page, `/contact?service=custom-ai-agents#ai-project`,
the calculator, map, and legal links on desktop and mobile.

```bash
# Use the actual Vercel review URL first, then the canonical GoDaddy URL.
curl -I https://YOUR-PROJECT.vercel.app/
curl -I https://YOUR-PROJECT.vercel.app/about
curl -I https://YOUR-PROJECT.vercel.app/nested/missing-page
curl -i https://YOUR-PROJECT.vercel.app/api/leads

curl -I http://digitaluniversepro.co/
curl -I https://www.digitaluniversepro.co/
curl -I https://digitaluniversepro.co/about/
curl -I https://digitaluniversepro.co/about/index.html
curl -I https://digitaluniversepro.co/nested/missing-page
```

Expected: valid pages are 200 with their own titles; unknown pages return 404
with working styles; aliases redirect to the slashless canonical URL. The
Vercel API returns JSON 405 for GET (it accepts POST/OPTIONS). Preview pages
have the noindex response header. Check `robots.txt` and `sitemap.xml` too.

When the owner supplies the destination, send one clearly identified test lead
with permission and confirm receipt there. Follow the success and failure checks
in [lead-funnel.md](lead-funnel.md), including GoDaddy-to-Vercel CORS. Local tests
simulate delivery and cannot establish actual CRM receipt.

The founder must finalize the business identity and policy text before public
launch. Legal pages still disclose missing inputs and remain noindex. Noindex
does not complete those policies. See [production-readiness.md](production-readiness.md).

References: [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json),
[Node functions and request parsing](https://vercel.com/docs/functions/runtimes/node-js).
