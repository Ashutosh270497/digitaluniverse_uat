import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const directPrimaryCtas = {
  'HeroWithForm.jsx': 2,
  'Services.jsx': 1,
};

test('active primary conversion CTAs use the canonical handler and label', async () => {
  for (const [filename, expectedCount] of Object.entries(directPrimaryCtas)) {
    const source = await readFile(new URL(`../../src/pages/home/sections/${filename}`, import.meta.url), 'utf8');
    assert.match(source, /activatePrimaryAuditForm/, `${filename} must use the canonical handler`);
    assert.match(source, /PRIMARY_CTA_LABEL/, `${filename} must use the canonical label`);
    assert.equal(
      source.match(/onClick=\{\(\) => activatePrimaryAuditForm\(/g)?.length ?? 0,
      expectedCount,
      `${filename} must wire every primary CTA to the canonical handler`,
    );
  }

  const finalSection = await readFile(new URL('../../src/pages/home/sections/FinalConversionSection.jsx', import.meta.url), 'utf8');
  assert.match(finalSection, /href=\{PRIMARY_AUDIT_ROUTE\}/);
  assert.match(finalSection, /trackPrimaryCtaClick/);
  const stickyHeader = await readFile(new URL('../../src/components/layout/StickyHeader.jsx', import.meta.url), 'utf8');
  assert.match(stickyHeader, /activatePrimaryAuditForm\(\{ ctaLocation \}\)/);
  assert.match(stickyHeader, /onClick=\{\(\) => handlePrimaryCta\('sticky_header'\)\}/);
  assert.match(stickyHeader, /onClick=\{\(\) => handlePrimaryCta\('mobile_navigation'\)\}/);
  assert.match(stickyHeader, /PRIMARY_CTA_LABEL/);
});

test('the primary form exposes the canonical focus target', async () => {
  const source = await readFile(new URL('../../src/features/lead-capture/AuditForm.jsx', import.meta.url), 'utf8');
  assert.match(source, /PRIMARY_AUDIT_FORM_ID/);
  assert.match(source, /PRIMARY_AUDIT_FIRST_FIELD_ID/);
});
