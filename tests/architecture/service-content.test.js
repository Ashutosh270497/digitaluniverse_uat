import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

const sectionBetween = (source, start, end) =>
  source.slice(source.indexOf(start), source.indexOf(end));

test('defines all six requested services with complete buyer-scope fields', async () => {
  const source = await readSource('src/content/serviceContent.ts');
  const services = sectionBetween(source, 'export const SERVICES', 'export const PROCESS_STEPS');

  for (const title of [
    'Amazon PPC and profitability management',
    'Account management and account health',
    'Listing SEO and catalog optimisation',
    'A+ Content, Brand Story and Storefront',
    'Product launch and growth strategy',
    'India-to-global marketplace expansion',
  ]) {
    assert.match(services, new RegExp(title.replace(/[+]/g, '\\+')));
  }

  for (const field of [
    'title:',
    'whoItIsFor:',
    'problemsSolved:',
    'deliverables:',
    'reportingCadence:',
    'expectedClientInvolvement:',
    'notIncluded:',
    'primaryOutcome:',
    'relevantCaseStudySlug:',
  ]) {
    assert.equal(
      services.match(new RegExp(field, 'g'))?.length,
      6,
      `each of the six services must define ${field}`,
    );
  }
});

test('service cards link to detail pages and retain one shared audit action', async () => {
  const source = await readSource('src/pages/home/sections/Services.jsx');
  assert.match(source, /SERVICES\.map/);
  assert.match(source, /activatePrimaryAuditForm/);
  assert.match(source, /PRIMARY_CTA_LABEL/);
  assert.match(source, /SERVICE_PAGE_PATHS\[service\.id\]/);
  const detail = await readSource('src/pages/services/ServicePage.jsx');
  assert.match(detail, /<SpnServiceLinks serviceKey=\{service\.spnServiceKey\}/);
  const spnLinks = await readSource('src/components/ui/SpnServiceLinks.jsx');
  assert.match(spnLinks, /target="_blank"/);
  assert.match(spnLinks, /rel="noopener noreferrer"/);
});

test('service reporting, exclusions, and case-study claims remain uncommitted until approved', async () => {
  const source = await readSource('src/content/serviceContent.ts');
  const services = sectionBetween(source, 'export const SERVICES', 'export const PROCESS_STEPS');

  assert.equal(services.match(/reportingCadence: null/g)?.length, 6);
  assert.equal(services.match(/notIncluded: null/g)?.length, 6);
  assert.equal(services.match(/relevantCaseStudySlug: null/g)?.length, 6);
});

test('defines the requested four-step process with agency and client ownership', async () => {
  const source = await readSource('src/content/serviceContent.ts');
  const process = sectionBetween(source, 'export const PROCESS_STEPS', 'export const ENGAGEMENT_TERMS');

  for (const title of [
    'Account diagnosis',
    'Growth plan and commercial proposal',
    'Implementation and optimisation',
    'Reporting and continuous improvement',
  ]) {
    assert.match(process, new RegExp(title));
  }

  assert.equal(process.match(/agencyOutput:/g)?.length, 4);
  assert.equal(process.match(/clientResponsibility:/g)?.length, 4);
});

test('engagement section identifies every missing commercial term without inventing values', async () => {
  const source = await readSource('src/content/serviceContent.ts');
  const terms = sectionBetween(source, 'export const ENGAGEMENT_TERMS', 'export const FAQ_ITEMS');

  for (const label of [
    'Pricing model',
    'Minimum engagement period',
    'What affects pricing',
    'Onboarding timeline',
    'Starting price or range',
  ]) {
    assert.match(terms, new RegExp(label));
  }

  assert.equal(terms.match(/value: null/g)?.length, 5);
});

test('public FAQ answers key enquiry questions without internal review notes', async () => {
  const source = await readSource('src/content/serviceContent.ts');
  const faq = source.slice(source.indexOf('export const FAQ_ITEMS'));
  assert.equal(faq.match(/question:/g)?.length, 8);
  for (const topic of ['free Amazon audit', 'marketplaces', 'Amazon password', 'engagement terms']) assert.ok(faq.includes(topic));
  assert.doesNotMatch(faq, /repository|not documented|not approved/);
});

test('rewritten commercial copy avoids unsupported generic promises', async () => {
  const sources = await Promise.all([
    readSource('src/content/serviceContent.ts'),
    readSource('src/pages/home/sections/Services.jsx'),
    readSource('src/pages/home/sections/WorkingProcess.jsx'),
    readSource('src/pages/home/sections/EngagementExpectations.jsx'),
    readSource('src/pages/home/sections/FAQ.jsx'),
  ]);
  const combined = sources.join('\n');

  assert.doesNotMatch(combined, /data-driven|best agency|guaranteed growth/i);
});
