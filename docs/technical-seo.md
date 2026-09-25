# Technical SEO architecture

## Current stack and rendering model

- Framework: React 19 with Vite 7.
- Rendering: client-rendered React with a Vite multi-page build.
- Static search layer: every build entry contains route-specific metadata and a complete static H1 before the shared React bundle executes.
- Styling: Tailwind CSS.
- Hosting observed on 26 August 2026: Apache.

The live server returned `200` for HTTP and HTTPS on both `digitaluniversepro.co` and `www.digitaluniversepro.co`. The repository did not contain a redirect configuration before this phase.

## Canonical decision

The canonical origin is:

`https://digitaluniversepro.co`

Reasons:

- It is the domain supplied for the project.
- It is already used by repository contact and brand configuration.
- A single non-`www` origin keeps canonical and internal URLs concise.

Every canonical route is slashless except the root URL.

## Native Vite implementation

`src/config/seo.js` is the source of truth for:

- Route titles and descriptions
- Static H1 copy
- Canonical URLs
- Index/noindex state
- Open Graph and Twitter/X metadata
- Organization, FAQ, and Breadcrumb structured data
- Sitemap and robots generation

`vite.config.js` uses the route collection as Rollup multi-page inputs under the `src/` Vite root. The plugin in `build/seoPlugin.js`:

1. Injects route-specific head metadata.
2. Inserts a static, complete H1 and route summary into the build entry.
3. Emits `robots.txt`.
4. Emits `sitemap.xml`.
5. Emits the approved brand logo at a stable favicon/social-card URL.

`npm run seo:verify` validates every generated HTML artifact after `npm run build`.

## Indexing policy

Indexable:

- `/`
- `/amazon-ppc-management`
- `/amazon-account-management`
- `/amazon-listing-optimization`
- `/amazon-a-plus-content`
- `/amazon-global-selling`
- `/about`
- `/contact`

Temporarily noindex:

- `/case-studies`: no case study currently passes the evidence and permission gate.
- `/case-studies/template`: unpublished authoring template.
- Legal routes: verified policy inputs have not been supplied.
- `/404.html`.

Noindex routes are excluded from the sitemap. Do not add them until their visible content is complete and approved.

## Structured data policy

- Organization schema appears on the homepage.
- FAQ schema appears only on the homepage, where the same `FAQ_ITEMS` collection is visibly rendered.
- Breadcrumb schema appears on internal pages and matches visible breadcrumb navigation.
- No review, rating, award, aggregate-offer, local-address, or case-study result schema is emitted.

## Apache deployment requirements

`public/.htaccess` is copied to the production build and:

- Redirects HTTP to HTTPS.
- Redirects `www` and any duplicate host to non-`www`.
- Redirects the legacy `/amazon-management` path.
- Removes public `index.html` URLs.
- Redirects trailing-slash variants to slashless URLs.
- Internally serves each Vite `<route>/index.html` entry.
- Uses `/404.html` as the real Apache error document.

The hosting account must allow:

- `mod_rewrite`
- `.htaccess` overrides, including FileInfo, Indexes, and Options directives (or an equivalent host setting)
- TLS certificates covering both `digitaluniversepro.co` and `www.digitaluniversepro.co`

The deployment process must upload dotfiles. Some FTP and control-panel uploaders omit `.htaccess` unless hidden files are enabled.

## Required post-deployment checks

Run:

```bash
curl -I http://digitaluniversepro.co/
curl -I http://www.digitaluniversepro.co/
curl -I https://www.digitaluniversepro.co/
curl -I https://digitaluniversepro.co/about/
curl -I https://digitaluniversepro.co/about/index.html
curl -I https://digitaluniversepro.co/not-a-real-page
```

Expected:

- All protocol/host duplicates permanently redirect to `https://digitaluniversepro.co`.
- `/about/` and `/about/index.html` permanently redirect to `/about`.
- An unknown route returns HTTP `404`, not a soft-`404` `200`.

Also validate:

- `/robots.txt`
- `/sitemap.xml`
- Canonicals in page source
- Organization, FAQ, and Breadcrumb JSON-LD in a structured-data validator
- Open Graph and Twitter/X previews

## Known content blockers

- Case studies remain noindex until approved evidence and client permission exist.
- Legal pages remain noindex until verified legal inputs are supplied.
- The contact form cannot deliver leads until its documented API/webhook environment variables are configured.
- The current social image is the approved square brand logo. A separately approved 1200×630 raster sharing image would improve large-card previews but is not required for the current `summary` card.
