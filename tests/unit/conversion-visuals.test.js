import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

const readPngDimensions = async (path) => {
  const png = await readFile(new URL(path, import.meta.url));
  assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
};

const sha256 = async (path) => createHash('sha256')
  .update(await readFile(new URL(path, import.meta.url)))
  .digest('hex');

test('sales snapshots render exact user-supplied source images from typed configuration', async () => {
  const source = await readSource('../../src/pages/home/sections/RealClientDashboards.jsx');
  const content = await readSource('../../src/content/salesSnapshots.ts');

  assert.match(source, /PUBLISHED_SALES_SNAPSHOTS\.filter/);
  assert.match(source, /snapshot\.previewImage/);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /do not measure the agency/);
  assert.doesNotMatch(source, /No sales screenshot is currently published/);
  assert.match(source, /<figcaption/);
  assert.match(source, /<dialog/);
  assert.match(source, /showModal\(\)/);
  assert.doesNotMatch(source, /46,57,877|107,968|97,149|53,64,884|Verified Data|Store is healthy/);

  assert.match(content, /readonly SalesSnapshot\[\]/);
  assert.doesNotMatch(content, /sourceDisclosure|dateRangeLabel/);
  assert.equal((content.match(/crop: \{ x:/g) || []).length, 6);
});

test('sales snapshot source images retain their original dimensions', async () => {
  assert.deepEqual(
    await readPngDimensions('../../src/assets/sales_snapshots/amazon-sales-snapshots-india-us-row.png'),
    { width: 2940, height: 1228 },
  );
  assert.deepEqual(
    await readPngDimensions('../../src/assets/sales_snapshots/amazon-sales-snapshots-four-marketplace-periods.png'),
    { width: 2940, height: 1524 },
  );
  assert.equal(
    await sha256('../../src/assets/sales_snapshots/amazon-sales-snapshots-india-us-row.png'),
    '1a52496c01ffc0a7ad880d1db0abea4e04e54aadad29f655e75b5f7b035f88f9',
  );
  assert.equal(
    await sha256('../../src/assets/sales_snapshots/amazon-sales-snapshots-four-marketplace-periods.png'),
    '6ff5eadb5e9544acd66c065e20c67a89177c48dd6700aeeb9cc940a534a14d01',
  );
});

test('growth calculator exposes its editable assumption and uses the canonical enquiry action', async () => {
  const [source, results] = await Promise.all([
    readSource('../../src/features/roi-calculator/ROICalculator.jsx'),
    readSource('../../src/features/roi-calculator/CalculatorResults.jsx'),
  ]);
  assert.match(source, /Calculate My Potential/);
  assert.match(source, /Extra revenue assumption/);
  assert.match(source, /not a forecast or guarantee/);
  assert.match(results, /Revenue gain \/ ad spend/);
  assert.match(results, /revenue, not profit ROI/);
  assert.match(results, /activatePrimaryAuditForm\(\{ ctaLocation: 'roi_calculator' \}\)/);
  assert.doesNotMatch(source + results, /proven strategies|Projected ROI/);
});

test('shared palette defines the company yellow and charcoal direction', async () => {
  const theme = await readSource('../../tailwind.config.js');

  assert.match(theme, /dark: '#17180f'/);
  assert.match(theme, /navy: '#24251a'/);
  assert.match(theme, /gold: '#ffda1a'/);
  assert.match(theme, /500: '#ffd400'/);
});
