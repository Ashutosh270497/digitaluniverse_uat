import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_ORIGIN,
  INDEXABLE_SEO_ROUTES,
  SEO_ROUTES,
  buildRobotsTxt,
  buildSitemapXml,
  getCanonicalUrl,
} from '../../src/config/seo.js';

test('uses one non-www HTTPS canonical origin', () => {
  assert.equal(CANONICAL_ORIGIN, 'https://digitaluniversepro.co');

  for (const route of SEO_ROUTES) {
    const canonical = getCanonicalUrl(route);
    if (!canonical) continue;

    assert.match(canonical, /^https:\/\/digitaluniversepro\.co(?:\/|$)/);
    assert.doesNotMatch(canonical, /www\./);
    assert.equal(canonical !== CANONICAL_ORIGIN && canonical.endsWith('/'), false);
  }
});

test('defines unique titles, descriptions, H1s, and physical entries', async () => {
  assert.equal(new Set(SEO_ROUTES.map((route) => route.title)).size, SEO_ROUTES.length);
  assert.equal(new Set(SEO_ROUTES.map((route) => route.description)).size, SEO_ROUTES.length);
  assert.equal(new Set(SEO_ROUTES.map((route) => route.h1)).size, SEO_ROUTES.length);

  for (const route of SEO_ROUTES) {
    await access(fileURLToPath(new URL(`../../src/${route.entry}`, import.meta.url)));
    assert.ok(route.title.length >= 30 && route.title.length <= 70, `${route.path} title length`);
    if (route.kind !== 'not-found') {
      assert.ok(
        route.description.length >= 110 && route.description.length <= 170,
        `${route.path} description length`,
      );
    }
  }
});

test('homepage uses the required title and complete static hero heading', () => {
  const homepage = SEO_ROUTES.find((route) => route.path === '/');

  assert.equal(
    homepage.title,
    'Amazon Growth & Marketplace Services | Digital Universe Pro',
  );
  assert.equal(
    homepage.h1,
    'Struggling to Scale? Let Us Help You Scale Your Amazon Business!',
  );
});

test('sitemap includes only canonical indexable routes', () => {
  const sitemap = buildSitemapXml();

  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, INDEXABLE_SEO_ROUTES.length);

  for (const route of INDEXABLE_SEO_ROUTES) {
    assert.ok(sitemap.includes(`<loc>${getCanonicalUrl(route)}</loc>`));
  }

  for (const route of SEO_ROUTES.filter((route) => !route.indexable)) {
    const canonical = getCanonicalUrl(route);
    if (canonical) assert.equal(sitemap.includes(`<loc>${canonical}</loc>`), false);
  }
});

test('robots file allows crawling and declares the canonical sitemap', () => {
  assert.equal(
    buildRobotsTxt(),
    'User-agent: *\nAllow: /\n\nSitemap: https://digitaluniversepro.co/sitemap.xml\n',
  );
});

test('FAQ schema is sourced from the same visible FAQ content collection', async () => {
  const [viteConfig, faqComponent] = await Promise.all([
    readFile(new URL('../../build/seoPlugin.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/home/sections/FAQ.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(viteConfig, /import \{ FAQ_ITEMS \} from '..\/src\/content\/serviceContent\.ts'/);
  assert.match(viteConfig, /buildStructuredData\(route, FAQ_ITEMS\)/);
  assert.match(faqComponent, /FAQ_ITEMS\.map/);
});

test('Apache rules consolidate hostname, protocol, trailing slashes, and real 404s', async () => {
  const source = await readFile(new URL('../../public/.htaccess', import.meta.url), 'utf8');

  assert.match(source, /https:\/\/digitaluniversepro\.co%\{REQUEST_URI\}/);
  assert.match(source, /HTTP_HOST/);
  assert.match(source, /HTTPS/);
  assert.match(source, /DirectorySlash Off/);
  assert.match(source, /index\\?\.html|index\.html/);
  assert.match(source, /ErrorDocument 404 \/404\.html/);
});
