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
  assert.match(source, /Work email or WhatsApp number/);
  assert.doesNotMatch(source, /Amazon store or ASIN URL/);
  assert.match(source, /Revenue currency/);
  assert.match(source, /Monthly Amazon revenue range/);
  assert.equal(source.match(/\brequired\b/g)?.length ?? 0, 4);
  assert.match(source, /type=\{contactIsWhatsApp \? 'tel' : 'email'\}/);
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
  const source = (await Promise.all([
    readFile(formUrl, 'utf8'),
    readFile(new URL('../../src/features/lead-capture/useAuditForm.js', import.meta.url), 'utf8'),
  ])).join('\n');

  assert.match(source, /status === 'submitting'/);
  assert.match(source, /status === 'success'/);
  assert.match(source, /status === 'error'/);
  assert.match(source, /LEAD_FUNNEL_CONFIG\.bookingCalendarUrl/);
  assert.match(source, /<LegalConsent/);
  assert.match(source, /Continue on WhatsApp|Contact us on WhatsApp instead/);
  assert.doesNotMatch(source, /console\./);
});

test('source contains one canonical lead form and one local calculator form', async () => {
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

  assert.equal(formCount, 2);
  assert.deepEqual(jsxFiles.filter((_, index) => /<form\b/.test(sources[index])).sort(), [
    'features/lead-capture/AuditForm.jsx',
    'features/roi-calculator/ROICalculator.jsx',
  ]);
});
