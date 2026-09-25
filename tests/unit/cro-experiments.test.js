import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CRO_EXPERIMENT_IDS,
  CRO_EXPERIMENTS,
  CRO_VARIANTS,
} from '../../src/experiments/catalog.js';
import { createExperimentRuntime } from '../../src/experiments/runtime.js';

const createStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
};

const createWindow = ({
  hostname = 'digitaluniversepro.co',
  search = '',
  webdriver = false,
} = {}) => ({
  location: { hostname, search },
  navigator: { webdriver },
  crypto: { randomUUID: () => 'stable-test-seed' },
});

const createConfig = (overrides = {}) => ({
  approved: true,
  activeExperimentId: CRO_EXPERIMENT_IDS.heroPositioning,
  treatmentPercentage: 50,
  excludedHostnames: ['localhost', '127.0.0.1'],
  excludeAutomation: true,
  internalQueryParameter: 'cro_internal',
  assignmentStorageKey: 'assignments',
  exclusionStorageKey: 'excluded',
  testMode: false,
  previewVariant: null,
  ...overrides,
});

test('catalog defines all five requested experiments with control and treatment variants', () => {
  assert.deepEqual(Object.keys(CRO_EXPERIMENTS).sort(), [
    CRO_EXPERIMENT_IDS.aboveFoldProof,
    CRO_EXPERIMENT_IDS.formPresentation,
    CRO_EXPERIMENT_IDS.heroPositioning,
    CRO_EXPERIMENT_IDS.primaryCtaCopy,
    CRO_EXPERIMENT_IDS.revenueRangeField,
  ].sort());

  for (const experiment of Object.values(CRO_EXPERIMENTS)) {
    assert.ok(experiment.variants[CRO_VARIANTS.control]);
    assert.ok(experiment.variants[CRO_VARIANTS.treatment]);
  }
  assert.equal(CRO_EXPERIMENTS[CRO_EXPERIMENT_IDS.aboveFoldProof].status, 'blocked');
  assert.match(
    CRO_EXPERIMENTS[CRO_EXPERIMENT_IDS.aboveFoldProof].blockedReason,
    /No case study currently meets/i,
  );
});

test('assignment is stable throughout a visit and survives a full-page navigation', () => {
  const storage = createStorage();
  const firstRuntime = createExperimentRuntime({
    config: createConfig(),
    windowObject: createWindow(),
    sessionStorageObject: storage,
    seedFactory: () => 'first-seed',
  });
  const firstAssignment = firstRuntime.getAssignment();
  const repeatedAssignment = firstRuntime.getAssignment();
  const reloadedRuntime = createExperimentRuntime({
    config: createConfig({ treatmentPercentage: 99 }),
    windowObject: createWindow(),
    sessionStorageObject: storage,
    seedFactory: () => 'different-seed',
  });

  assert.deepEqual(repeatedAssignment, firstAssignment);
  assert.deepEqual(reloadedRuntime.getAssignment(), firstAssignment);
  assert.match(storage.values.get('assignments'), /hero_positioning/);
});

test('one active experiment cannot change values belonging to another experiment', () => {
  const runtime = createExperimentRuntime({
    config: createConfig({ activeExperimentId: CRO_EXPERIMENT_IDS.primaryCtaCopy }),
    windowObject: createWindow(),
    sessionStorageObject: createStorage(),
    seedFactory: () => 'one-active-experiment',
  });

  assert.equal(
    runtime.getValue(CRO_EXPERIMENT_IDS.heroPositioning, 'headline', 'fallback'),
    CRO_EXPERIMENTS[CRO_EXPERIMENT_IDS.heroPositioning].variants.control.headline,
  );
});

test('approval is required and blocked experiments cannot assign real traffic', () => {
  const unapproved = createExperimentRuntime({
    config: createConfig({ approved: false }),
    windowObject: createWindow(),
    sessionStorageObject: createStorage(),
  });
  const blocked = createExperimentRuntime({
    config: createConfig({ activeExperimentId: CRO_EXPERIMENT_IDS.aboveFoldProof }),
    windowObject: createWindow(),
    sessionStorageObject: createStorage(),
  });

  assert.equal(unapproved.getAssignment(), null);
  assert.equal(blocked.getAssignment(), null);
  assert.deepEqual(unapproved.getAnalyticsContext(), {});
  assert.deepEqual(blocked.getAnalyticsContext(), {});
});

test('internal query, excluded hostnames, and automation are excluded from assignment', () => {
  for (const windowObject of [
    createWindow({ search: '?cro_internal=1' }),
    createWindow({ hostname: 'localhost' }),
    createWindow({ webdriver: true }),
  ]) {
    const storage = createStorage();
    const runtime = createExperimentRuntime({
      config: createConfig(),
      windowObject,
      sessionStorageObject: storage,
    });

    assert.equal(runtime.getAssignment(), null);
    assert.equal(runtime.isExcluded(), true);
    assert.equal(storage.values.get('excluded'), 'true');
    assert.deepEqual(runtime.getAnalyticsContext(), {});
  }
});

test('development preview can inspect a variant but cannot emit experiment context', () => {
  const runtime = createExperimentRuntime({
    config: createConfig({
      testMode: true,
      previewVariant: CRO_VARIANTS.treatment,
    }),
    windowObject: createWindow(),
    sessionStorageObject: createStorage(),
  });

  assert.equal(runtime.getAssignment().variant, CRO_VARIANTS.treatment);
  assert.equal(runtime.getAssignment().preview, true);
  assert.deepEqual(runtime.getAnalyticsContext(), {});
});

test('experiment values are consumed behind dormant feature flags', async () => {
  const [hero, form, cta, analytics] = await Promise.all([
    readFile(new URL('../../src/pages/home/sections/HeroWithForm.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/features/lead-capture/useAuditForm.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/features/lead-capture/primaryCta.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/analytics/index.js', import.meta.url), 'utf8'),
  ]);

  assert.match(hero, /heroPositioning/);
  assert.match(hero, /formPresentation/);
  assert.doesNotMatch(hero, /rotatingHeroMessage/);
  assert.match(form, /revenueRangeField/);
  assert.match(cta, /primaryCtaCopy/);
  assert.match(analytics, /getCroAnalyticsContext/);
});
