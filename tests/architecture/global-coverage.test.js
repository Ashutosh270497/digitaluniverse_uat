import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('homepage places global coverage after client proof and before FAQ', async () => {
  const source = await readSource('../../src/pages/home/HomePage.jsx');
  const servicesIndex = source.indexOf('<Services />');
  const coverageIndex = source.indexOf('<GlobalCoverageSection />');
  const caseStudiesIndex = source.indexOf('<FAQ />');

  assert.ok(servicesIndex >= 0);
  assert.ok(coverageIndex > servicesIndex);
  assert.ok(caseStudiesIndex > coverageIndex);
});

test('marketplace locations are centralized, typed, coordinate-based, and evidence labelled', async () => {
  const source = await readSource('../../src/content/marketplaceCoverage.ts');

  assert.match(source, /export interface MarketplaceLocation/);
  for (const key of [
      'id',
      'label',
      'shortLabel',
      'latitude',
      'longitude',
      'flagAsset',
      'marketplaceUrl',
      'active',
      'verified',
      'accessibleDescription',
  ]) assert.match(source, new RegExp(`\\b${key}\\??:`), `typed model must expose ${key}`);

  for (const id of ['north-america', 'europe', 'asia']) {
    assert.match(source, new RegExp(`id: '${id}'`));
  }
  assert.equal((source.match(/evidenceSource: 'Founder-supplied regional coverage/g) ?? []).length, 3);
  assert.equal((source.match(/\{ id: '[^']+', originId:/g) ?? []).length, 2);
  assert.doesNotMatch(source, /latitude:\s*['"]/);
  assert.doesNotMatch(source, /longitude:\s*['"]/);
});

test('unverified legacy coverage figures remain centralized and are withheld', async () => {
  const [coverage, metrics] = await Promise.all([
    readSource('../../src/content/marketplaceCoverage.ts'),
    readSource('../../src/content/businessMetrics.ts'),
  ]);

  for (const id of ['hero-marketplaces', 'hero-countries', 'hero-support-availability']) {
    assert.match(coverage, new RegExp(`'${id}'`));
    assert.match(metrics, new RegExp(`unverifiedMetric\\('${id}'`));
  }
  assert.match(coverage, /metric\.verificationStatus === 'verified'/);
  assert.match(coverage, /metric\.evidenceSource !== null/);
});

test('coverage component provides semantic fallback, safe credential links, and the supplied partner directory', async () => {
  const [section, visual, staticMap, projection] = await Promise.all([
    readSource('../../src/features/global-coverage/GlobalCoverageSection.jsx'),
    readSource('../../src/features/global-coverage/GlobalCoverageVisual.jsx'),
    readSource('../../src/features/global-coverage/StaticCoverageMap.jsx'),
    readSource('../../src/features/global-coverage/mapProjection.js'),
  ]);

  assert.match(section, /id="global-coverage"/);
  assert.match(section, /aria-labelledby="global-coverage-heading"/);
  assert.match(section, /GlobalCoverageVisual/);
  assert.match(section, /VisualErrorBoundary/);
  assert.match(section, /IntersectionObserver/);
  assert.match(section, /visibilitychange/);
  assert.match(section, /prefers-reduced-motion: reduce/);
  assert.match(section, /href="#amazon-credentials"/);
  assert.match(section, /data-region-select/);
  assert.match(section, /data-region-directory/);
  assert.match(section, /directoryCode/);
  assert.match(section, /tourPlaying/);
  assert.doesNotMatch(section, /Figure withheld/);
  assert.doesNotMatch(section, /15\+|50\+|24\/7/);

  assert.match(visual, /StaticCoverageMap/);
  assert.match(visual, /data-map-marker/);
  assert.match(visual, /handlePointerMove/);
  assert.match(visual, /handleKeyDown/);
  assert.match(visual, /aria-pressed/);
  assert.match(staticMap, /data-map-fallback/);
  assert.doesNotMatch(section + visual, /GlobalCoverageWebGL|supportsEnhancedMap/);
  assert.match(projection, /geoEqualEarth/);
  assert.match(projection, /countries-110m\.json/);
});
