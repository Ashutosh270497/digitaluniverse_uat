import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SEO_ROUTES } from '../../src/config/seo.js';

const readSource = (relativePath) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

test('typed case-study model contains every required decision field', async () => {
  const source = await readSource('src/content/caseStudies.ts');

  for (const field of [
    'clientLabel:',
    'productCategory:',
    'marketplace:',
    'initialProblem:',
    'startingMetrics:',
    'workPerformed:',
    'endingMetrics:',
    'timePeriod:',
    'acos:',
    'tacos:',
    'revenue:',
    'conversionRate:',
    'organicSalesShare:',
    'verification:',
    'testimonial:',
    'clientApprovedLogoOrImage:',
  ]) {
    assert.match(source, new RegExp(field), `model must include ${field}`);
  }

  assert.match(
    source,
    /Client identity withheld with permission; performance data verified from Seller Central\./,
  );
});

test('homepage publishes at most three evidence-gated case studies', async () => {
  const [model, component] = await Promise.all([
    readSource('src/content/caseStudies.ts'),
    readSource('src/pages/home/sections/CaseStudies.jsx'),
  ]);

  assert.match(component, /getFeaturedCaseStudies\(3\)/);
  assert.match(model, /slice\(0, Math\.min\(Math\.max\(limit, 0\), 3\)\)/);
  assert.match(model, /publicationStatus === 'published'/);
  assert.match(model, /hasText\(caseStudy\.verification\.performanceEvidenceReference\)/);
  assert.match(model, /hasText\(caseStudy\.verification\.agencyImpactMethodology\)/);
  assert.match(model, /hasText\(caseStudy\.verification\.publicationPermissionReference\)/);
  assert.match(component, /raw revenue screenshot is supporting\s+context/);
  assert.doesNotMatch(component, /\$2\.9M|\$4\.66M|\$5\.36M|340%|156%|73%/);
});

test('Seller Central assets require permission and redaction', async () => {
  const [model, card] = await Promise.all([
    readSource('src/content/caseStudies.ts'),
    readSource('src/components/case-studies/CaseStudyCard.jsx'),
  ]);

  assert.match(model, /asset\.clientApproved/);
  assert.match(model, /asset\.width > 0/);
  assert.match(model, /asset\.height > 0/);
  assert.match(model, /hasText\(asset\.permissionReference\)/);
  assert.match(model, /isCaseStudyPublishable\(caseStudy\)/);
  assert.match(model, /asset\.kind !== 'seller-central-screenshot' \|\| asset\.redacted/);
  assert.match(card, /Redacted Seller Central source evidence/);
  assert.match(card, /does not prove agency attribution by itself/);
  assert.match(card, /width=\{asset\.width\}/);
  assert.match(card, /height=\{asset\.height\}/);
  assert.match(card, /decoding="async"/);
});

test('social proof uses explanations rather than a generic verification badge', async () => {
  const source = await readSource('src/pages/home/sections/Testimonials.jsx');

  assert.match(source, /In our clients’ words/);
  assert.match(source, /Original review-platform record unavailable/);
  assert.match(source, /getFeaturedTestimonials/);
  assert.doesNotMatch(source, />Verified</);
  assert.doesNotMatch(source, /Client(?:&apos;|')s/);
});

test('retired logo carousels are absent from the homepage', async () => {
  const homepage = await readSource('src/pages/home/HomePage.jsx');
  assert.doesNotMatch(homepage, /ClientLogosMarquee|TrustedBrands/);
  assert.equal((homepage.match(/<SelectedClientBrands \/>/g) ?? []).length, 1);
  assert.equal((homepage.match(/<ClientBrandMotionShowcase \/>/g) ?? []).length, 0);
});

test('official SPN evidence is prominent and the canonical audit CTA follows case studies', async () => {
  const [trustBar, source] = await Promise.all([
    readSource('src/pages/home/sections/AmazonTrustBar.jsx'),
    readSource('src/pages/home/sections/CaseStudies.jsx'),
  ]);

  assert.match(trustBar, /Listed on Amazon/);
  assert.match(trustBar, /SITE_CONFIG\.spnRegions\.map/);
  assert.match(trustBar, /region\.links\[service\.key\]/);
  assert.match(trustBar, /rel="noopener noreferrer"/);
  assert.match(
    source,
    /onClick=\{\(\) => activatePrimaryAuditForm\(\{ ctaLocation: 'case_studies' \}\)\}/,
  );
  assert.match(source, /\{PRIMARY_CTA_LABEL\}/);
});

test('future case-study template remains noindex and cannot imply a client result', async () => {
  const page = await readSource('src/pages/case-studies/CaseStudyDetailPage.jsx');
  const seoRoute = SEO_ROUTES.find((route) => route.path === '/case-studies/template');

  assert.match(page, /Unpublished, noindex template/);
  assert.match(page, /contains no invented client result/);
  assert.match(page, /Not provided — required before publication/);
  assert.equal(seoRoute?.indexable, false);
});
