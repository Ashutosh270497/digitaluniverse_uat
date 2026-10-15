import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const formUrl = new URL('../../src/features/lead-capture/AuditForm.jsx', import.meta.url);

test('canonical form uses persistent labels, required fields, and accessible errors', async () => {
  const source = (await Promise.all([
    readFile(formUrl, 'utf8'),
    readFile(new URL('../../src/features/lead-capture/useAuditForm.js', import.meta.url), 'utf8'),
  ])).join('\n');

  assert.match(source, /<label htmlFor=\{PRIMARY_AUDIT_FIRST_FIELD_ID\}/);
  assert.match(source, /Email <span aria-hidden="true">\*<\/span>/);
  assert.match(source, /WhatsApp number <span aria-hidden="true">\*<\/span>/);
  assert.doesNotMatch(source, /contactMethod|Work email or WhatsApp number/);
  assert.doesNotMatch(source, /Amazon store or ASIN URL/);
  assert.match(source, /Revenue currency/);
  assert.match(source, /Monthly Amazon revenue range/);
  assert.equal(source.match(/\brequired\b/g)?.length ?? 0, 5);
  assert.match(source, /type="email"[\s\S]*name="email"[\s\S]*autoComplete="email"/);
  assert.match(source, /type="tel"[\s\S]*name="whatsapp"/);
  assert.match(source, /autoComplete="tel-country-code"/);
  // Placeholders are masked so no real person's number is shown as an example.
  assert.match(source, /placeholder=\{formData\.dialCode \? 'XXXXX XXXXX' : '\+971 XX XXX XXXX'\}/);
  assert.match(source, /name="revenueCurrency"/);
  assert.match(source, /autoComplete="name"/);
  assert.match(source, /aria-describedby/);
  assert.match(source, /aria-invalid/);
});

test('keyboard submission uses native form and submit-button semantics', async () => {
  const source = (await Promise.all([
    readFile(formUrl, 'utf8'),
    readFile(new URL('../../src/features/lead-capture/useAuditForm.js', import.meta.url), 'utf8'),
  ])).join('\n');

  assert.match(source, /<form[\s\S]*method="post"[\s\S]*onSubmit=\{handleSubmit\}/);
  assert.match(source, /<button[\s\S]*type="submit"/);
  assert.doesNotMatch(source, /onKeyDown|onKeyPress/);
});

test('form has explicit loading, success, error, consent, calendar, and WhatsApp states', async () => {
  const readSources = (paths) => Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), 'utf8')))
    .then((sources) => sources.join('\n'));
  const formSource = await readSources([
    '../../src/features/lead-capture/AuditForm.jsx',
    '../../src/features/lead-capture/useAuditForm.js',
  ]);
  const thankYouSource = await readSources([
    '../../src/pages/thank-you/ThankYouPage.jsx',
    '../../src/features/lead-capture/AuditDetailsSection.jsx',
    '../../src/features/lead-capture/useAuditDetails.js',
  ]);

  assert.match(formSource, /status === 'submitting'/);
  assert.match(formSource, /status === 'success'/);
  assert.match(formSource, /status === 'error'/);
  assert.match(formSource, /saveThankYouHandoff\(/);
  assert.match(formSource, /location\?\.assign\(THANK_YOU_ROUTE\)/);
  assert.match(formSource, /<LegalConsent/);
  assert.match(formSource, /Contact us on WhatsApp instead/);
  assert.match(thankYouSource, /readThankYouHandoff\(/);
  assert.match(thankYouSource, /status === 'sent'/);
  assert.match(thankYouSource, /status === 'skipped'/);
  assert.match(thankYouSource, /LEAD_FUNNEL_CONFIG\.bookingCalendarUrl/);
  assert.match(thankYouSource, /Chat on WhatsApp/);
  assert.match(thankYouSource, /Thanks for getting in touch/);
  for (const source of [formSource, thankYouSource]) assert.doesNotMatch(source, /console\./);
});

test('source contains the audit form, the optional Step 2 form and one local calculator form', async () => {
  const componentsUrl = new URL('../../src/', import.meta.url);
  const entries = await readdir(componentsUrl, { recursive: true });
  const jsxFiles = entries.filter((entry) => entry.endsWith('.jsx'));
  const sources = await Promise.all(
    jsxFiles.map((entry) => readFile(new URL(entry, componentsUrl), 'utf8')),
  );
  const formCount = sources.reduce(
    (count, source) => count + (source.match(/<form\b/g)?.length ?? 0),
    0,
  );

  assert.equal(formCount, 3);
  assert.deepEqual(jsxFiles.filter((_, index) => /<form\b/.test(sources[index])).sort(), [
    'features/lead-capture/AuditDetailsSection.jsx',
    'features/lead-capture/AuditForm.jsx',
    'features/roi-calculator/ROICalculator.jsx',
  ]);
});
