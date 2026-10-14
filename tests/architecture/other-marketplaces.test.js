import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('Flipkart, Meesho and TikTok Shop use small local logos with stable dimensions', async () => {
  const content = await read('src/content/marketplaces.ts');
  for (const [id, file] of [['flipkart', 'flipkart.webp'], ['meesho', 'meesho.webp'], ['tiktok-shop', 'tiktok-shop.webp']]) {
    assert.match(content, new RegExp(`id: '${id}'`));
    assert.match(content, new RegExp(`assets/marketplaces/${file}`));
    const { size } = await stat(new URL(`../../src/assets/marketplaces/${file}`, import.meta.url));
    assert.ok(size < 15_000, `${file} stays optimised (${size} bytes)`);
  }
  assert.equal(content.match(/logoWidth: \d+/g)?.length, 3);
  assert.equal(content.match(/logoHeight: \d+/g)?.length, 3);
});

test('other marketplaces appear beside Amazon without implying partnership', async () => {
  const [hero, coverage, component, services, seo, content] = await Promise.all([
    read('src/pages/home/sections/HeroWithForm.jsx'),
    read('src/features/global-coverage/GlobalCoverageSection.jsx'),
    read('src/components/ui/OtherMarketplaces.jsx'),
    read('src/content/serviceContent.ts'),
    read('src/config/seo.js'),
    read('src/content/marketplaces.ts'),
  ]);
  assert.match(hero, /<MarketplaceLogoRow \/>/);
  assert.ok(hero.indexOf('<AmazonPartnerBadges') < hero.indexOf('<MarketplaceLogoRow'), 'Amazon credentials stay first');
  assert.match(coverage, /<MarketplaceCards \/>/);
  assert.match(component, /MARKETPLACE_TRADEMARK_NOTE/);
  assert.match(content, /do not imply affiliation or endorsement/);
  assert.doesNotMatch(component + content, /\bpartners?\b|verified|official/i);
  assert.match(services, /question: 'Which marketplaces do you support\?'/);
  for (const name of ['Flipkart', 'Meesho', 'TikTok Shop']) {
    assert.match(services, new RegExp(name));
    assert.match(seo, new RegExp(name));
  }
});
