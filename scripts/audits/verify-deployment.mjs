import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { SEO_ROUTES } from '../../src/config/seo.js';

const root = new URL('../../', import.meta.url);
const dist = new URL('dist/', root);
const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));

assert.equal(config.outputDirectory, 'dist');
assert.equal(config.trailingSlash, false);
assert.ok(config.functions['api/leads.js'].maxDuration > 8);
assert.equal(config.rewrites.some(({ source }) => /\*|\(.*\)/.test(source)), false,
  'Do not rewrite unknown routes or API requests to the homepage');
assert.ok(config.headers.some(({ has, headers }) =>
  has?.some(({ type, value }) => type === 'host' && new RegExp(`^${value}$`).test('review.vercel.app'))
  && headers.some(({ key, value }) => key === 'X-Robots-Tag' && value.includes('noindex'))),
'Vercel review domains must not be indexed');

for (const route of SEO_ROUTES) {
  if (route.path !== '/' && route.kind !== 'not-found') {
    assert.equal(config.rewrites.find(({ source }) => source === route.path)?.destination,
      `/${route.entry}`, `${route.path} serves its own HTML metadata`);
    assert.equal(config.redirects.find(({ source }) => source === `/${route.entry}`)?.destination,
      route.path, `${route.path} physical entry redirects to canonical route`);
  }
  const html = await readFile(new URL(route.entry, dist), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
  assert.ok(assets.length > 0, `${route.path} bundles exist`);
  for (const asset of assets) {
    assert.ok(asset.startsWith('/assets/'), `${route.path} must work at nested URLs: ${asset}`);
    await access(new URL(asset.slice(1), dist));
  }
}

for (const file of await readdir(dist, { recursive: true })) {
  assert.doesNotMatch(file, /(^|\/)(?:\.env(?:\..*)?|node_modules|api|server|shared|tests|docs|\.git)(\/|$)/,
    `Source, secrets and server files must not be shipped in the public artifact: ${file}`);
  assert.ok(!file.endsWith('.map'), 'Production source maps must remain private');
}
assert.equal(await readFile(new URL('.htaccess', dist), 'utf8'),
  await readFile(new URL('public/.htaccess', root), 'utf8'));
console.log(`Deployment verification passed: ${SEO_ROUTES.length} entries, Vercel routing, preview noindex, root assets and Apache configuration.`);
