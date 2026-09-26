import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('pages expose a skip link and a stable main-content target', async () => {
  const [skipLink, app, marketing, legal, caseStudies, caseStudyDetail] = await Promise.all([
    readSource('../../src/components/ui/SkipLink.jsx'),
    readSource('../../src/pages/home/HomePage.jsx'),
    readSource('../../src/components/layout/MarketingLayout.jsx'),
    readSource('../../src/pages/legal/LegalNoticePage.jsx'),
    readSource('../../src/pages/case-studies/CaseStudiesPage.jsx'),
    readSource('../../src/pages/case-studies/CaseStudyDetailPage.jsx'),
  ]);

  assert.match(caseStudies, /<MarketingLayout>/);
  assert.match(skipLink, /href="#main-content"/);
  for (const source of [app, marketing, legal, caseStudyDetail]) {
    assert.match(source, /<SkipLink \/>/);
    assert.match(source, /<main[^>]+id="main-content"/);
  }
});

test('FAQ buttons publish explicit expanded state and controlled panels', async () => {
  const source = await readSource('../../src/pages/home/sections/FAQ.jsx');

  assert.match(source, /type="button"/);
  assert.match(source, /aria-expanded=\{isExpanded\}/);
  assert.match(source, /aria-controls=\{panelId\}/);
  assert.match(source, /role="region"/);
  assert.match(source, /aria-labelledby=\{buttonId\}/);
  assert.match(source, /hidden=\{!isExpanded\}/);
});

test('the canonical form keeps labels, mobile keyboard hints, and announced errors', async () => {
  const source = await readSource('../../src/features/lead-capture/AuditForm.jsx');

  assert.match(source, /<label htmlFor=/);
  assert.match(source, /<legend/);
  assert.match(source, /aria-describedby=/);
  assert.match(source, /aria-invalid=/);
  assert.match(source, /role=\{status === 'error' \? 'alert' : 'status'\}/);
  assert.match(source, /inputMode=\{contactIsWhatsApp \? 'tel' : 'email'\}/);
  assert.doesNotMatch(source, /name="amazonUrl"|inputMode="url"/);
  assert.match(source, /name="revenueCurrency"/);
  assert.match(source, /enterKeyHint="next"/);
});

test('active portrait images are responsive, dimensioned, local, and lazy below the fold', async () => {
  const [homepagePortrait, internalPortrait] = await Promise.all([
    readSource('../../src/pages/home/sections/MeetTheExpert.jsx'),
    readSource('../../src/pages/about/AboutPage.jsx'),
  ]);

  for (const source of [homepagePortrait, internalPortrait]) {
    assert.match(source, /gautam-soni-600\.webp/);
    assert.match(source, /gautam-soni-1067\.webp/);
    assert.match(source, /srcSet=/);
    assert.match(source, /sizes=/);
    assert.match(source, /width="1067"/);
    assert.match(source, /height="1600"/);
    assert.match(source, /loading="lazy"/);
    assert.match(source, /decoding="async"/);
  }
});

test('the active stylesheet uses local system fonts and honours reduced motion', async () => {
  const [css, tailwindConfig] = await Promise.all([
    readSource('../../src/styles/index.css'),
    readSource('../../tailwind.config.js'),
  ]);

  assert.doesNotMatch(css, /fonts\.googleapis\.com|@import\s+url/);
  assert.match(tailwindConfig, /ui-sans-serif/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /scroll-behavior:\s*auto\s*!important/);
});

test('duplicate logo carousels and motion libraries are absent from the active homepage tree', async () => {
  const app = await readSource('../../src/pages/home/HomePage.jsx');

  assert.doesNotMatch(app, /ClientLogosMarquee|TrustedBrands|framer-motion|WhatsAppFAB/);
});
