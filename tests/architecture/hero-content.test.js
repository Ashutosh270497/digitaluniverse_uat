import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('hero shares the recorded copy with SEO and provides a stable accessible heading', async () => {
  const [hero, catalog, cta, seo] = await Promise.all([read('src/pages/home/sections/HeroHeadline.jsx'), read('src/experiments/catalog.js'), read('src/features/lead-capture/primaryCta.js'), read('src/config/seo.js')]);
  assert.match(catalog, /headline: HERO_HEADLINE/);
  assert.match(seo, /h1: HERO_HEADLINE/);
  assert.equal((hero.match(/<h1/g) ?? []).length, 1);
  assert.match(hero, /aria-label=\{headline\}/);
  assert.match(hero, /aria-hidden="true"/);
  assert.doesNotMatch(hero, /data-hero-motion-control|Pause headline|Play headline/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(hero, /aria-live="polite"|aria-live="assertive"/);
  assert.match(cta, /SECONDARY_CTA_HREF = '\/amazon-spn'/);
});

test('hero retains credentials, the canonical form and focusable reveal behavior', async () => {
  const [hero, badge] = await Promise.all([
    read('src/pages/home/sections/HeroWithForm.jsx'),
    read('src/components/ui/AmazonPartnerBadge.jsx'),
  ]);
  assert.match(hero, /<AmazonPartnerBadges priority/);
  assert.match(badge, /SITE_CONFIG\.amazonAdsPartnerUrl/);
  assert.match(badge, /noopener noreferrer/);
  assert.match(hero, /<AuditForm formLocation="hero"/);
  assert.match(hero, /PRIMARY_AUDIT_FORM_REVEAL_EVENT/);
  assert.match(hero, /focusPrimaryAuditForm\(\)/);
  assert.ok(hero.indexOf('{PRIMARY_CTA_LABEL}') < hero.indexOf('<AuditForm'));
});
