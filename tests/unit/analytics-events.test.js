import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ANALYTICS_CONSENT,
  createAnalytics,
  installSpaRouteTracking,
} from '../../src/analytics/analytics.js';
import {
  ANALYTICS_EVENTS,
  captureUtmAttribution,
  sanitizeAnalyticsContext,
} from '../../src/analytics/events.js';
import {
  createClarityProvider,
  createGa4Provider,
  createLinkedInProvider,
  createMetaProvider,
} from '../../src/analytics/providers.js';

const createStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
};

const createWindow = (url = 'https://digitaluniversepro.co/') => {
  const parsed = new URL(url);
  const location = {
    origin: parsed.origin,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
  };
  const listeners = new Map();
  const history = {
    state: null,
    pushState(state, _title, nextUrl) {
      this.state = state;
      const next = new URL(nextUrl, location.origin);
      Object.assign(location, {
        pathname: next.pathname,
        search: next.search,
        hash: next.hash,
      });
    },
    replaceState(state, _title, nextUrl) {
      this.state = state;
      const next = new URL(nextUrl, location.origin);
      Object.assign(location, {
        pathname: next.pathname,
        search: next.search,
        hash: next.hash,
      });
    },
  };

  return {
    innerWidth: 390,
    location,
    history,
    crypto: { randomUUID: () => 'analytics-test-event-id' },
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
    removeEventListener(name) {
      listeners.delete(name);
    },
    listeners,
  };
};

const nextMicrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

test('event context uses a strict non-sensitive allowlist', () => {
  const sanitized = sanitizeAnalyticsContext({
    page_path: '/contact',
    cta_label: 'Request My Free Amazon Audit',
    service: 'amazon-ppc-profitability',
    error_fields: ['contact', 'amazonUrl', '<script>'],
    name: 'Private Name',
    email: 'private@example.com',
    phone: '+91 11111 11111',
    message: 'Private message',
    amazonUrl: 'https://amazon.in/dp/PRIVATE',
    url: 'https://example.com/private',
  });

  assert.deepEqual(sanitized, {
    page_path: '/contact',
    cta_label: 'Request My Free Amazon Audit',
    service: 'amazon-ppc-profitability',
    error_fields: ['contact', 'amazonUrl', 'script'],
  });
  assert.doesNotMatch(JSON.stringify(sanitized), /Private Name|private@example|11111|amazon\.in/);
});

test('captures the five supported UTM fields and nothing else', () => {
  const attribution = captureUtmAttribution({
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=india-growth&utm_content=hero&utm_term=amazon+ppc&email=private%40example.com',
  });

  assert.deepEqual(attribution, {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'india-growth',
    utm_content: 'hero',
    utm_term: 'amazon ppc',
  });
});

test('does not load providers or dispatch events before consent', async () => {
  const calls = { load: 0, dispatch: [], consent: [] };
  const provider = {
    name: 'fake',
    load: () => { calls.load += 1; },
    dispatch: (event) => calls.dispatch.push(event),
    updateConsent: (consent) => calls.consent.push(consent),
  };
  const localStorageObject = createStorage();
  const sessionStorageObject = createStorage();
  const windowObject = createWindow(
    'https://digitaluniversepro.co/?utm_source=google&utm_campaign=amazon-growth',
  );
  const analytics = createAnalytics({
    config: {
      debug: false,
      testMode: false,
      consentStorageKey: 'consent',
      attributionStorageKey: 'attribution',
    },
    providers: [provider],
    windowObject,
    documentObject: { title: 'Homepage' },
    localStorageObject,
    sessionStorageObject,
  });

  analytics.initialize();
  analytics.track(ANALYTICS_EVENTS.primaryCtaClick, {
    cta_label: 'Request My Free Amazon Audit',
    cta_location: 'hero',
    email: 'must-not-send@example.com',
  });

  assert.equal(calls.load, 0);
  assert.equal(calls.dispatch.length, 0);
  assert.equal(analytics.getQueueLength(), 1);
  assert.equal(windowObject.location.search, '');
  assert.equal(sessionStorageObject.values.size, 0);

  analytics.setConsent(ANALYTICS_CONSENT.granted);
  await nextMicrotask();

  assert.equal(calls.load, 1);
  assert.equal(calls.dispatch.length, 1);
  assert.equal(calls.dispatch[0].name, ANALYTICS_EVENTS.primaryCtaClick);
  assert.equal(calls.dispatch[0].params.utm_source, 'google');
  assert.equal(calls.dispatch[0].params.utm_campaign, 'amazon-growth');
  assert.equal(calls.dispatch[0].params.email, undefined);
  assert.match(sessionStorageObject.values.get('attribution'), /amazon-growth/);
});

test('declining consent clears queued events and stored attribution', async () => {
  const calls = { dispatch: 0 };
  const localStorageObject = createStorage({ consent: ANALYTICS_CONSENT.granted });
  const sessionStorageObject = createStorage({ attribution: '{"utm_source":"google"}' });
  const analytics = createAnalytics({
    config: {
      testMode: false,
      consentStorageKey: 'consent',
      attributionStorageKey: 'attribution',
    },
    providers: [{ load() {}, dispatch() { calls.dispatch += 1; }, updateConsent() {} }],
    windowObject: createWindow(),
    documentObject: { title: 'Homepage' },
    localStorageObject,
    sessionStorageObject,
  });

  analytics.initialize();
  await nextMicrotask();
  analytics.setConsent(ANALYTICS_CONSENT.denied);
  analytics.track(ANALYTICS_EVENTS.auditFormSuccess, { form_location: 'hero' });

  assert.equal(calls.dispatch, 0);
  assert.equal(analytics.getQueueLength(), 0);
  assert.equal(sessionStorageObject.values.has('attribution'), false);
  assert.equal(localStorageObject.values.get('consent'), ANALYTICS_CONSENT.denied);
});

test('test mode prevents loading and dispatch even when consent is granted', async () => {
  let loadCalls = 0;
  let dispatchCalls = 0;
  const analytics = createAnalytics({
    config: { testMode: true },
    providers: [{
      load() { loadCalls += 1; },
      dispatch() { dispatchCalls += 1; },
    }],
    windowObject: createWindow(),
    documentObject: { title: 'Test' },
    localStorageObject: createStorage({ analytics_consent: ANALYTICS_CONSENT.granted }),
    sessionStorageObject: createStorage(),
  });

  analytics.initialize();
  analytics.setConsent(ANALYTICS_CONSENT.granted);
  analytics.track(ANALYTICS_EVENTS.auditFormSuccess);
  await nextMicrotask();

  assert.equal(loadCalls, 0);
  assert.equal(dispatchCalls, 0);
});

test('dedupe keys prevent duplicate conversion events', async () => {
  const dispatched = [];
  const analytics = createAnalytics({
    config: {
      testMode: false,
      consentStorageKey: 'consent',
      attributionStorageKey: 'attribution',
    },
    providers: [{ load() {}, dispatch: (event) => dispatched.push(event) }],
    windowObject: createWindow(),
    documentObject: { title: 'Homepage' },
    localStorageObject: createStorage({ consent: ANALYTICS_CONSENT.granted }),
    sessionStorageObject: createStorage(),
  });

  analytics.initialize();
  await nextMicrotask();
  const options = { dedupeKey: 'audit-form-success-1', dedupeWindowMs: 60_000 };
  assert.equal(analytics.track(ANALYTICS_EVENTS.auditFormSuccess, {}, options), true);
  assert.equal(analytics.track(ANALYTICS_EVENTS.auditFormSuccess, {}, options), false);
  assert.equal(dispatched.length, 1);
});

test('every consented funnel event receives non-sensitive experiment context', async () => {
  const dispatched = [];
  const analytics = createAnalytics({
    config: {
      testMode: false,
      consentStorageKey: 'consent',
      attributionStorageKey: 'attribution',
    },
    providers: [{ load() {}, dispatch: (event) => dispatched.push(event) }],
    windowObject: createWindow(),
    documentObject: { title: 'Homepage' },
    localStorageObject: createStorage({ consent: ANALYTICS_CONSENT.granted }),
    sessionStorageObject: createStorage(),
    getDefaultContext: () => ({
      experiment_id: 'primary_cta_copy',
      experiment_variant: 'treatment',
      email: 'must-not-send@example.com',
    }),
  });

  analytics.initialize();
  await nextMicrotask();
  analytics.trackPageView();
  analytics.track(ANALYTICS_EVENTS.auditFormSuccess, { form_location: 'hero' });

  assert.equal(dispatched.length, 2);
  for (const event of dispatched) {
    assert.equal(event.params.experiment_id, 'primary_cta_copy');
    assert.equal(event.params.experiment_variant, 'treatment');
    assert.equal(event.params.email, undefined);
  }
});

test('SPA history changes trigger one page-view call per new path', () => {
  const windowObject = createWindow('https://digitaluniversepro.co/');
  let pageViews = 0;
  const analytics = {
    captureAttribution() {},
    trackPageView() { pageViews += 1; },
  };
  const stop = installSpaRouteTracking({ analytics, windowObject });

  windowObject.history.pushState({}, '', '/contact?utm_source=linkedin');
  windowObject.history.replaceState({}, '', '/contact');
  windowObject.history.pushState({}, '', '/about');

  assert.equal(pageViews, 2);
  stop();
});

test('provider adapters use configured IDs and standard event APIs without network calls in tests', () => {
  const scripts = [];
  const documentObject = {
    head: { appendChild: (script) => scripts.push(script) },
    createElement: () => ({ dataset: {} }),
    getElementById: () => null,
  };
  const windowObject = createWindow();
  const ga4 = createGa4Provider({ measurementId: 'G-TEST123', windowObject, documentObject });
  const clarity = createClarityProvider({ projectId: 'claritytest', windowObject, documentObject });
  const meta = createMetaProvider({ pixelId: '123456', windowObject, documentObject });
  const linkedin = createLinkedInProvider({
    partnerId: '654321',
    conversionIds: { audit_form_success: '777' },
    windowObject,
    documentObject,
  });

  for (const provider of [ga4, clarity, meta, linkedin]) provider.load();
  const event = {
    name: ANALYTICS_EVENTS.auditFormSuccess,
    params: { page_path: '/', form_location: 'hero' },
    eventId: 'opaque-event-id',
  };
  for (const provider of [ga4, clarity, meta, linkedin]) provider.dispatch(event);

  assert.equal(scripts.length, 4);
  assert.match(scripts[0].src, /G-TEST123/);
  assert.match(scripts[1].src, /claritytest/);
  assert.match(scripts[2].src, /fbevents\.js/);
  assert.match(scripts[3].src, /insight\.min\.js/);
  assert.ok(windowObject.dataLayer.length > 0);
  assert.deepEqual(windowObject.lintrk.q.at(-1), [
    'track',
    { conversion_id: 777, event_id: 'opaque-event-id' },
  ]);
});

test('every requested event is instrumented and production IDs remain environment-only', async () => {
  const [eventSource, configSource, formSource, faqSource, marketingSource] = await Promise.all([
    readFile(new URL('../../src/analytics/events.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/analytics/config.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/features/lead-capture/useAuditForm.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/home/sections/FAQ.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/pages/services/ServicePage.jsx', import.meta.url), 'utf8'),
  ]);

  for (const eventName of Object.values(ANALYTICS_EVENTS).filter((name) => name !== 'page_view')) {
    assert.match(eventSource, new RegExp(`'${eventName}'`));
  }
  for (const environmentKey of [
    'VITE_GA4_MEASUREMENT_ID',
    'VITE_CLARITY_PROJECT_ID',
    'VITE_META_PIXEL_ID',
    'VITE_LINKEDIN_PARTNER_ID',
  ]) {
    assert.match(configSource, new RegExp(environmentKey));
  }
  assert.match(formSource, /auditFormStart|auditFormValidationError|auditFormSubmit/);
  assert.match(formSource, /auditFormSuccess|auditFormFailure|calendarOpen/);
  assert.match(faqSource, /faqOpen/);
  assert.match(marketingSource, /serviceView/);
  assert.doesNotMatch(configSource, /G-[A-Z0-9]{6,}|pixelId:\s*['"]\d+|partnerId:\s*['"]\d+/);
});
