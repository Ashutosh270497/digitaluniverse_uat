import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCEPTED_DEV_ADVISORIES, evaluateAudit } from '../../scripts/lib/auditPolicy.mjs';

const advisory = (id, name, severity = 'high') => ({
  source: 1,
  name,
  severity,
  title: `${name} advisory`,
  url: `https://github.com/advisories/${id}`,
});
const report = (...advisories) => ({
  vulnerabilities: Object.fromEntries(advisories.map((item) => [item.name, { via: [item, 'parent-package'] }])),
  metadata: { vulnerabilities: { total: advisories.length } },
});
const clean = report();
const accepted = { 'GHSA-aaaa': { package: 'build-tool', reviewed: '2026-10-14', reason: 'No fix exists.' } };

test('reviewed build-tool advisories pass and stay visible', () => {
  const result = evaluateAudit({ all: report(advisory('GHSA-aaaa', 'build-tool')), production: clean, accepted });

  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.accepted.map(({ id }) => id), ['GHSA-aaaa']);
  assert.deepEqual(result.stale, []);
});

test('an unreviewed advisory fails the audit', () => {
  const result = evaluateAudit({
    all: report(advisory('GHSA-aaaa', 'build-tool'), advisory('GHSA-bbbb', 'other-tool', 'low')),
    production: clean,
    accepted,
  });

  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /GHSA-bbbb other-tool \(low\) is not reviewed/);
});

test('shipped dependencies are never exempt, even for an accepted advisory', () => {
  const shipped = report(advisory('GHSA-aaaa', 'build-tool'));
  const result = evaluateAudit({ all: shipped, production: shipped, accepted });

  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /ships to visitors/);
});

test('a missing or failed npm audit report fails instead of passing silently', () => {
  for (const broken of [null, { error: { code: 'ENOTFOUND' } }]) {
    const result = evaluateAudit({ all: broken, production: clean, accepted });
    assert.equal(result.failures.length, 1);
    assert.match(result.failures[0], /did not return a report/);
  }
});

test('accepted advisories that are no longer reported are flagged for removal', () => {
  const result = evaluateAudit({ all: clean, production: clean, accepted });

  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.stale, ['GHSA-aaaa']);
});

test('every accepted advisory records the package, review date and reason', () => {
  for (const [id, entry] of Object.entries(ACCEPTED_DEV_ADVISORIES)) {
    assert.match(id, /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
    assert.ok(entry.package);
    assert.match(entry.reviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.reason.length > 20);
  }
});
