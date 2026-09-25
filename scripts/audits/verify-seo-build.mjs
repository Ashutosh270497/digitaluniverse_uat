import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  BRAND_IMAGE_PATH,
  SEO_ROUTES,
  buildRobotsTxt,
  buildSitemapXml,
  getCanonicalUrl,
} from '../../src/config/seo.js';

const rootUrl = new URL('../../', import.meta.url);
const distUrl = new URL('../../dist/', import.meta.url);

const readDistFile = (relativePath) => readFile(new URL(relativePath, distUrl), 'utf8');

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

for (const route of SEO_ROUTES) {
  const html = await readDistFile(route.entry);
  const canonicalUrl = getCanonicalUrl(route);
  const expectedRobots = route.indexable ? 'index, follow' : 'noindex, nofollow';
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));

  assert.ok(html.includes(`<title>${route.title}</title>`), `${route.path} title`);
  assert.equal((html.match(/<title>/g) ?? []).length, 1, `${route.path} one title`);
  assert.ok(
    html.includes(`name="description" content="${escapeHtml(route.description)}"`),
    `${route.path} description`,
  );
  assert.equal(
    (html.match(/name="description"/g) ?? []).length,
    1,
    `${route.path} one meta description`,
  );
  assert.ok(html.includes(`name="robots" content="${expectedRobots}"`), `${route.path} robots`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route.path} must expose one static H1`);
  assert.ok(html.includes(escapeHtml(route.h1)), `${route.path} static H1 copy`);
  assert.ok(html.includes('property="og:title"'), `${route.path} Open Graph title`);
  assert.ok(html.includes('property="og:description"'), `${route.path} Open Graph description`);
  assert.ok(html.includes('name="twitter:card" content="summary"'), `${route.path} Twitter card`);
  assert.ok(html.includes('rel="icon"'), `${route.path} favicon`);
  assert.ok(html.includes('rel="apple-touch-icon"'), `${route.path} Apple touch icon`);

  if (canonicalUrl) {
    assert.ok(html.includes(`rel="canonical" href="${canonicalUrl}"`), `${route.path} canonical`);
    assert.ok(html.includes(`property="og:url" content="${canonicalUrl}"`), `${route.path} OG URL`);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, `${route.path} one canonical`);
  } else {
    assert.doesNotMatch(html, /rel="canonical"/, '404 must not declare a canonical');
  }

  if (route.kind === 'home') {
    assert.ok(schemas.some((schema) => schema['@type'] === 'Organization'), 'homepage Organization schema');
    const faqSchema = schemas.find((schema) => schema['@type'] === 'FAQPage');
    assert.ok(faqSchema, 'homepage FAQ schema');
    assert.equal(faqSchema.mainEntity.length, 8, 'homepage FAQ schema must match eight visible FAQs');
  } else {
    assert.equal(
      schemas.some((schema) => schema['@type'] === 'FAQPage'),
      false,
      `${route.path} must not contain FAQ schema`,
    );
  }

  if (route.path !== '/' && route.kind !== 'not-found') {
    assert.ok(
      schemas.some((schema) => schema['@type'] === 'BreadcrumbList'),
      `${route.path} breadcrumb schema`,
    );
  }
}

assert.equal(await readDistFile('robots.txt'), buildRobotsTxt());
assert.equal(await readDistFile('sitemap.xml'), buildSitemapXml());
await access(new URL(BRAND_IMAGE_PATH.slice(1), distUrl));
await access(new URL('.htaccess', distUrl));
await access(fileURLToPath(new URL('public/.htaccess', rootUrl)));

console.log(`SEO build verification passed for ${SEO_ROUTES.length} HTML entries.`);
