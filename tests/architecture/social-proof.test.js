import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('one typed model owns supported brand and testimonial content', async () => {
  const model = await readSource('../../src/content/socialProof.ts');

  for (const field of [
    'id:',
    'name:',
    'logo:',
    'region:',
    'marketplace:',
    'category:',
    'featured:',
    'testimonialId:',
    'caseStudyId:',
    'websiteUrl:',
    'permissionConfirmed:',
  ]) {
    assert.match(model, new RegExp(field), `client-brand model must include ${field}`);
  }

  const clientIds = [...model.matchAll(/^ {4}id: '([^']+)',$/gm)]
    .map((match) => match[1])
    .filter((id) => !id.match(/-2025-/));
  assert.equal(clientIds.length, 18);
  assert.equal(new Set(clientIds).size, clientIds.length);
  assert.doesNotMatch(model, /geocarter/i);
  assert.doesNotMatch(model, /TechGear Pro|Top 1%|100% success|Award-Winning/);
});

test('every published logo uses an existing optimised local asset and stable dimensions', async () => {
  const [model, logoWall, motionShowcase, css] = await Promise.all([
    readSource('../../src/content/socialProof.ts'),
    readSource('../../src/pages/home/sections/SelectedClientBrands.jsx'),
    readSource('../../src/pages/home/sections/ClientBrandMotionShowcase.jsx'),
    readSource('../../src/styles/index.css'),
  ]);
  const imports = [...model.matchAll(/from '\.\.\/assets\/brand_logos\/optimized\/([^']+\.webp)'/g)]
    .map((match) => match[1]);

  assert.equal(imports.length, 18);
  assert.equal(new Set(imports).size, 18);
  for (const filename of imports) {
    const url = new URL(`../../src/assets/brand_logos/optimized/${filename}`, import.meta.url);
    await access(url);
    assert.ok((await stat(url)).size > 0, `${filename} must not be empty`);
  }

  for (const component of [logoWall, motionShowcase]) {
    assert.match(component, /width=\{brand\.logoWidth\}/);
    assert.match(component, /height=\{brand\.logoHeight\}/);
    assert.match(component, /object-contain/);
    assert.doesNotMatch(component, /opacity-0|framer-motion|animate=/);
  }
  assert.match(logoWall, /loading="lazy"/);
  assert.match(motionShowcase, /loading="eager"/);
  assert.match(motionShowcase, /Pause brand movement/);
  assert.match(motionShowcase, /Resume brand movement/);
  assert.match(css, /@keyframes client-logo-pan/);
  assert.match(motionShowcase, /animationDirection: direction === 'reverse' \? 'alternate-reverse' : 'alternate'/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.client-logo-track \{\s*animation: none !important;/);
});

test('primary logo wall is region-separated, evidence-safe and placed after official credentials', async () => {
  const [app, logoWall] = await Promise.all([
    readSource('../../src/pages/home/HomePage.jsx'),
    readSource('../../src/pages/home/sections/SelectedClientBrands.jsx'),
  ]);

  assert.ok(app.indexOf('<SelectedClientBrands />') > app.indexOf('<AmazonTrustBar />'));
  assert.ok(app.indexOf('<SelectedClientBrands />') < app.indexOf('<Services />'));
  assert.match(logoWall, /In good company/);
  assert.match(logoWall, /Supporting Indian and international brands/);
  assert.match(logoWall, /'International'/);
  assert.match(logoWall, /'India'/);
  assert.match(logoWall, /getApprovedClientBrandsByRegion\(region\)/);
  assert.match(logoWall, /<details/);
  assert.doesNotMatch(logoWall, /International Client(?:'s|&apos;s)/);
  assert.doesNotMatch(logoWall, /Indian Client(?:'s|&apos;s)/);
  assert.doesNotMatch(logoWall, /Trusted by|500\+|100M\+|99\.9%|carousel/);
});

test('duplicate moving brand rows remain outside the active homepage', async () => {
  const [app, motionShowcase] = await Promise.all([
    readSource('../../src/pages/home/HomePage.jsx'),
    readSource('../../src/pages/home/sections/ClientBrandMotionShowcase.jsx'),
  ]);

  assert.ok(app.includes('<SelectedClientBrands />'));
  assert.doesNotMatch(app, /ClientBrandMotionShowcase/);
  assert.match(motionShowcase, /'International'/);
  assert.match(motionShowcase, /'India'/);
  assert.match(motionShowcase, /heading: 'International Clients'/);
  assert.match(motionShowcase, /heading: 'Indian Clients'/);
  assert.match(motionShowcase, /direction: 'forward'/);
  assert.match(motionShowcase, /direction: 'reverse'/);
  assert.doesNotMatch(motionShowcase, /Trusted by|500\+|100M\+|99\.9%|carousel/);
});

test('testimonials retain exact legacy wording without unsupported mappings or badges', async () => {
  const [model, component] = await Promise.all([
    readSource('../../src/content/socialProof.ts'),
    readSource('../../src/pages/home/sections/Testimonials.jsx'),
  ]);

  assert.match(model, /Working with DIGITAL UNIVERSE has been a great experience\./);
  assert.match(model, /Digital Universe has exceeded our expectations/);
  assert.match(model, /repository does not contain the original review record/);
  assert.match(model, /brandId: null/);
  assert.match(model, /role: null/);
  assert.match(component, /getFeaturedTestimonials\(3\)/);
  assert.match(component, /<time/);
  assert.doesNotMatch(component, /Star|Verified|rating/);
});

test('verified outcome claims remain evidence-gated', async () => {
  const [caseStudies, compactProof] = await Promise.all([
    readSource('../../src/pages/home/sections/CaseStudies.jsx'),
    readSource('../../src/pages/home/sections/CompactConversionProof.jsx'),
  ]);

  assert.match(caseStudies, /getFeaturedCaseStudies\(3\)/);
  assert.match(caseStudies, /repository contains no real Seller Central result screenshot/);
  assert.doesNotMatch(caseStudies, /\$2\.9M|\$4\.66M|\$5\.36M|340%|156%|73%/);
  assert.match(compactProof, /getVerifiedMetrics\('agency-summary'\)\.slice\(0, 3\)/);
  assert.match(compactProof, /getFeaturedClientBrands\(4\)/);
  assert.match(compactProof, /Agency outcome metrics are not shown/);
});
