import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SITE_CONFIG } from '../../src/config/site.js';
import {
  CASE_STUDIES_ROUTE,
  CASE_STUDY_TEMPLATE_ROUTE,
  getCaseStudyPath,
  getCaseStudySlug,
  getLegalRoute,
  getMarketingRoute,
  LEGAL_ROUTES,
  MARKETING_ROUTES,
  normalizePathname,
  resolveSiteRoute,
} from '../../src/config/routes.js';

test('defines each canonical legal route without placeholder links', () => {
  assert.deepEqual(SITE_CONFIG.legalLinks, {
    privacy: '/privacy-policy',
    terms: '/terms-of-service',
    cookie: '/cookie-policy',
  });
  assert.equal(Object.values(SITE_CONFIG.legalLinks).some((path) => path === '#' || path === ''), false);
});

test('resolves legal routes with or without trailing slashes', () => {
  for (const route of Object.values(LEGAL_ROUTES)) {
    assert.equal(getLegalRoute(route.path)?.key, route.key);
    assert.equal(getLegalRoute(`${route.path}/`)?.key, route.key);
    assert.equal(getLegalRoute(`${route.path}/index.html`)?.key, route.key);
    assert.equal(resolveSiteRoute(route.path).type, 'legal');
  }
});

test('privacy policy publishes the supplied content and real contact links', async () => {
  const source = await readFile(
    new URL('../../src/content/legal/PrivacyPolicyContent.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /At Digital Universe Pro, we respect your privacy/);
  assert.match(source, /Information We Collect/);
  assert.match(source, /How We Use Your Information/);
  assert.match(source, /Information Sharing/);
  assert.match(source, /Data Security/);
  assert.match(source, /Your Rights/);
  assert.match(source, /href="mailto:support@digitaluniversepro\.co"/);
  assert.match(source, />\s*support@digitaluniversepro\.co\s*</);
  assert.match(source, /By submitting your information through our forms/);
  const page = await readFile(new URL('../../src/pages/legal/LegalNoticePage.jsx', import.meta.url), 'utf8');
  assert.match(page, /isPrivacyPolicy \? \(/);
});

test('terms route renders the supplied draft without inventing missing legal details', async () => {
  const [pageSource, termsSource, requirementsSource] = await Promise.all([
    readFile(new URL('../../src/pages/legal/LegalNoticePage.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/content/legal/TermsOfServiceContent.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/content/legal/requirements.js', import.meta.url), 'utf8'),
  ]);

  assert.match(pageSource, /isTermsOfService \? \(\s*<TermsOfServiceContent/);
  assert.match(termsSource, /Draft — not yet effective/);
  assert.match(termsSource, /1\. Nature of the Website|number="1" title="Nature of the Website"/);
  assert.match(termsSource, /28\. Contact Us|number="28" title="Contact Us"/);
  assert.match(termsSource, /Amazon Account Access and Security/);
  assert.match(termsSource, /Performance and Results Disclaimer/);
  assert.match(termsSource, /Governing Law and Dispute Resolution/);
  assert.match(termsSource, /href=\{SITE_CONFIG\.legalLinks\.privacy\}/);
  assert.match(termsSource, /mailto:\$\{SITE_CONFIG\.contact\.email\}/);
  assert.doesNotMatch(termsSource, /\[INSERT [^\]]+\]/);
  assert.match(requirementsSource, /Full contracting legal entity name and entity type/);
  assert.match(requirementsSource, /Arbitration seat and venue/);
  assert.match(requirementsSource, /INR 10,000 free-Website-use liability cap/);
});

test('distinguishes the homepage from unknown paths', () => {
  assert.equal(normalizePathname('/index.html'), '/');
  assert.deepEqual(resolveSiteRoute('/'), { type: 'home' });
  assert.deepEqual(resolveSiteRoute('/missing-page'), { type: 'not-found', path: '/missing-page' });
});

test('resolves every search-intent marketing route with or without a trailing slash', () => {
  for (const route of Object.values(MARKETING_ROUTES)) {
    assert.equal(getMarketingRoute(route.path)?.key, route.key);
    assert.equal(getMarketingRoute(`${route.path}/`)?.key, route.key);
    assert.deepEqual(resolveSiteRoute(route.path), { type: 'marketing', route });
  }
});

test('resolves the case-study library, template, and future detail paths', () => {
  assert.deepEqual(resolveSiteRoute(CASE_STUDIES_ROUTE), { type: 'case-studies' });
  assert.deepEqual(resolveSiteRoute(`${CASE_STUDIES_ROUTE}/`), { type: 'case-studies' });
  assert.deepEqual(resolveSiteRoute(CASE_STUDY_TEMPLATE_ROUTE), { type: 'case-study-template' });
  assert.equal(getCaseStudyPath('home-decor-us'), '/case-studies/home-decor-us');
  assert.equal(getCaseStudySlug('/case-studies/home-decor-us/'), 'home-decor-us');
  assert.equal(getCaseStudySlug('/case-studies/%2F'), null);
  assert.equal(getCaseStudySlug('/case-studies/%E0%A4%A'), null);
  assert.deepEqual(resolveSiteRoute('/case-studies/home-decor-us'), {
    type: 'case-study-detail',
    slug: 'home-decor-us',
  });
});

test('each legal route has a static build entry', async () => {
  for (const route of Object.values(LEGAL_ROUTES)) {
    const entryUrl = new URL(`../../src${route.path}/index.html`, import.meta.url);
    await access(fileURLToPath(entryUrl));
  }
});

test('case-study library and template routes have static build entries', async () => {
  for (const path of [CASE_STUDIES_ROUTE, CASE_STUDY_TEMPLATE_ROUTE]) {
    const entryUrl = new URL(`../../src${path}/index.html`, import.meta.url);
    await access(fileURLToPath(entryUrl));
  }
});

test('every marketing route has a static Vite entry', async () => {
  for (const route of Object.values(MARKETING_ROUTES)) {
    const entryUrl = new URL(`../../src${route.path}/index.html`, import.meta.url);
    await access(fileURLToPath(entryUrl));
  }
});
