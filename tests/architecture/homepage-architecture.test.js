import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOME_SECTION_IDS, PRIMARY_NAV_ITEMS } from '../../src/config/navigation.js';

const requestedComponentOrder = [
  '<StickyHeader />',
  '<HeroWithForm />',
  '<AmazonTrustBar />',
  '<SelectedClientBrands />',
  '<Stats />',
  '<Services />',
  '<AIServices />',
  '<RealClientDashboards />',
  '<GrowthCalculatorSection />',
  '<WorkingProcess />',
  '<MeetTheExpert />',
  '<Testimonials />',
  '<GlobalCoverageSection />',
  '<FAQ />',
  '<FinalConversionSection />',
  '<Footer />',
];

test('homepage renders the requested semantic section order', async () => {
  const source = await readFile(new URL('../../src/pages/home/HomePage.jsx', import.meta.url), 'utf8');
  let previousIndex = -1;

  for (const component of requestedComponentOrder) {
    const currentIndex = source.indexOf(component);
    assert.ok(currentIndex > previousIndex, `${component} must appear in the requested order`);
    previousIndex = currentIndex;
  }

  assert.match(source, /<main(?:\s[^>]*)?>/);
  assert.match(source, /<\/main>/);
  assert.doesNotMatch(
    source,
    /UrgencyBanner|WhyChooseUs|IsItWorthIt|BookConsultation|DrayaAISection|ContactForm|WhatsAppFAB|FloatingElements/,
  );
});

test('primary navigation exposes every requested anchor', () => {
  assert.deepEqual(PRIMARY_NAV_ITEMS, [
    { label: 'Amazon Services', href: '#services' },
    { label: 'AI Services', href: '#ai-services' },
    { label: 'Results', href: '#sales-snapshots' },
    { label: 'Process', href: '#process' },
    { label: 'About', href: '#about' },
    { label: 'FAQ', href: '#faq' },
  ]);
  assert.equal(HOME_SECTION_IDS.audit, 'book-audit');
});

test('every primary navigation anchor has a rendered section target', async () => {
  const sectionSources = await Promise.all(
    ['Services.jsx', 'AIServices.jsx', 'RealClientDashboards.jsx', 'WorkingProcess.jsx', 'MeetTheExpert.jsx', 'FAQ.jsx'].map(
      (filename) => readFile(new URL(`../../src/pages/home/sections/${filename}`, import.meta.url), 'utf8'),
    ),
  );
  const renderedTargets = sectionSources.join('\n');

  for (const item of PRIMARY_NAV_ITEMS) {
    const sectionId = item.href.slice(1);
    assert.match(
      renderedTargets,
      new RegExp(`id="${sectionId}"|id=\\{HOME_SECTION_IDS\\.${sectionId}\\}`),
      `${item.label} must have a rendered target`,
    );
  }
});

test('homepage landmarks and mobile navigation are explicitly labelled', async () => {
  const [header, footer] = await Promise.all([
    readFile(new URL('../../src/components/layout/StickyHeader.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/layout/Footer.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(header, /<header/);
  assert.match(header, /aria-label="Primary navigation"/);
  assert.match(header, /aria-expanded=\{mobileMenuOpen\}/);
  assert.match(header, /aria-controls="mobile-navigation"/);
  assert.match(footer, /<footer/);
  assert.match(footer, /aria-label="Legal navigation"/);
});
