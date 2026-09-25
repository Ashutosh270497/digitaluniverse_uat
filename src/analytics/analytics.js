import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENTS,
  captureUtmAttribution,
  getDeviceCategory,
  getPagePath,
  sanitizeAnalyticsContext,
} from './events.js';

export const ANALYTICS_CONSENT = Object.freeze({
  unknown: 'unknown',
  granted: 'granted',
  denied: 'denied',
});

const EVENT_QUEUE_LIMIT = 50;
let eventSequence = 0;

const safeStorageRead = (storage, key) => {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
};

const safeStorageWrite = (storage, key, value) => {
  try {
    storage?.setItem?.(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeStorageRemove = (storage, key) => {
  try {
    storage?.removeItem?.(key);
    return true;
  } catch {
    return false;
  }
};

const readStoredConsent = (storage, key) => {
  const value = safeStorageRead(storage, key);
  return value === ANALYTICS_CONSENT.granted || value === ANALYTICS_CONSENT.denied
    ? value
    : ANALYTICS_CONSENT.unknown;
};

const readStoredAttribution = (storage, key) => {
  try {
    const value = JSON.parse(safeStorageRead(storage, key) ?? '{}');
    return sanitizeAnalyticsContext(value);
  } catch {
    return {};
  }
};

const createEventId = (windowObject) => {
  const randomUuid = windowObject?.crypto?.randomUUID?.();
  if (randomUuid) return randomUuid;
  eventSequence += 1;
  return `dup-${Date.now()}-${eventSequence}`;
};

export const createAnalytics = ({
  config,
  providers = [],
  windowObject = globalThis.window,
  documentObject = globalThis.document,
  localStorageObject = windowObject?.localStorage,
  sessionStorageObject = windowObject?.sessionStorage,
  consoleObject = globalThis.console,
  getDefaultContext = () => ({}),
} = {}) => {
  const settings = {
    debug: Boolean(config?.debug),
    testMode: Boolean(config?.testMode),
    consentStorageKey: config?.consentStorageKey ?? 'analytics_consent',
    attributionStorageKey: config?.attributionStorageKey ?? 'analytics_attribution',
  };
  const listeners = new Set();
  const queue = [];
  const dedupeTimestamps = new Map();
  let consent = readStoredConsent(localStorageObject, settings.consentStorageKey);
  let attribution = consent === ANALYTICS_CONSENT.granted
    ? readStoredAttribution(sessionStorageObject, settings.attributionStorageKey)
    : {};
  let providersReady = false;
  let providersLoading = null;
  let initialized = false;

  const log = (message, detail = undefined) => {
    if (!settings.debug || settings.testMode) return;
    consoleObject?.info?.(`[analytics] ${message}`, detail ?? '');
  };

  const captureAttribution = () => {
    const currentAttribution = captureUtmAttribution(windowObject?.location);
    if (Object.keys(currentAttribution).length) {
      attribution = { ...attribution, ...currentAttribution };
    }
    if (consent === ANALYTICS_CONSENT.granted && Object.keys(attribution).length) {
      safeStorageWrite(
        sessionStorageObject,
        settings.attributionStorageKey,
        JSON.stringify(attribution),
      );
    }
    return { ...attribution };
  };

  const removeQueryFromBrowserAddress = () => {
    if (!windowObject?.location?.search || !windowObject?.history?.replaceState) return false;
    const cleanLocation = `${windowObject.location.pathname}${windowObject.location.hash ?? ''}`;
    windowObject.history.replaceState(windowObject.history.state, '', cleanLocation);
    return true;
  };

  const dispatch = (event) => {
    if (settings.testMode || consent !== ANALYTICS_CONSENT.granted) return false;

    for (const provider of providers) {
      try {
        provider.dispatch?.(event);
      } catch (error) {
        log(`${provider.name ?? 'provider'} dispatch failed`, error?.message);
      }
    }
    log(`sent ${event.name}`, event.params);
    return providers.length > 0;
  };

  const flushQueue = () => {
    if (!providersReady || consent !== ANALYTICS_CONSENT.granted) return;
    while (queue.length) dispatch(queue.shift());
  };

  const ensureProviders = () => {
    if (settings.testMode || consent !== ANALYTICS_CONSENT.granted) {
      return Promise.resolve(false);
    }
    if (providersReady) return Promise.resolve(true);
    if (providersLoading) return providersLoading;

    providersLoading = Promise.all(
      providers.map(async (provider) => {
        try {
          await provider.load?.();
          return true;
        } catch (error) {
          log(`${provider.name ?? 'provider'} failed to load`, error?.message);
          return false;
        }
      }),
    ).then(() => {
      providersReady = true;
      providersLoading = null;
      flushQueue();
      return true;
    });

    return providersLoading;
  };

  const isDuplicate = (dedupeKey, dedupeWindowMs) => {
    if (!dedupeKey) return false;
    const now = Date.now();
    const previous = dedupeTimestamps.get(dedupeKey);
    if (previous !== undefined && now - previous < dedupeWindowMs) return true;
    dedupeTimestamps.set(dedupeKey, now);
    return false;
  };

  const track = (name, context = {}, options = {}) => {
    if (settings.testMode || !ANALYTICS_EVENT_NAMES.includes(name)) return false;
    if (isDuplicate(options.dedupeKey, options.dedupeWindowMs ?? 2_000)) return false;

    captureAttribution();
    let defaultContext = {};
    try {
      defaultContext = getDefaultContext() ?? {};
    } catch {
      defaultContext = {};
    }
    const params = sanitizeAnalyticsContext({
      page_path: getPagePath(windowObject?.location),
      device_category: getDeviceCategory(windowObject),
      ...defaultContext,
      ...attribution,
      ...context,
    });
    const event = Object.freeze({
      name,
      params: Object.freeze(params),
      eventId: createEventId(windowObject),
    });

    if (consent === ANALYTICS_CONSENT.denied) {
      log(`blocked ${name}: consent denied`, params);
      return false;
    }
    if (consent !== ANALYTICS_CONSENT.granted || !providersReady) {
      if (queue.length >= EVENT_QUEUE_LIMIT) queue.shift();
      queue.push(event);
      log(`queued ${name}: awaiting consent/provider`, params);
      if (consent === ANALYTICS_CONSENT.granted) void ensureProviders();
      return true;
    }

    return dispatch(event);
  };

  const setConsent = (nextConsent) => {
    if (![ANALYTICS_CONSENT.granted, ANALYTICS_CONSENT.denied].includes(nextConsent)) {
      return false;
    }

    consent = nextConsent;
    safeStorageWrite(localStorageObject, settings.consentStorageKey, consent);
    for (const provider of providers) provider.updateConsent?.(consent);

    if (consent === ANALYTICS_CONSENT.granted) {
      captureAttribution();
      void ensureProviders();
    } else {
      queue.splice(0, queue.length);
      attribution = {};
      safeStorageRemove(sessionStorageObject, settings.attributionStorageKey);
    }

    for (const listener of listeners) listener(consent);
    log(`consent ${consent}`);
    return true;
  };

  const initialize = () => {
    if (initialized) return false;
    initialized = true;
    captureAttribution();
    removeQueryFromBrowserAddress();
    if (consent === ANALYTICS_CONSENT.granted) void ensureProviders();
    return true;
  };

  const trackPageView = () => track(ANALYTICS_EVENTS.pageView, {
    page_path: getPagePath(windowObject?.location),
    page_title: documentObject?.title ?? '',
  });

  return Object.freeze({
    initialize,
    track,
    trackPageView,
    captureAttribution,
    setConsent,
    getConsent: () => consent,
    getAttribution: () => ({ ...attribution }),
    getQueueLength: () => queue.length,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
};

export const installSpaRouteTracking = ({ analytics, windowObject = globalThis.window }) => {
  if (!windowObject?.history || !windowObject?.addEventListener) return () => {};

  let lastPath = getPagePath(windowObject.location);
  const onRouteChange = () => {
    analytics.captureAttribution();
    const nextPath = getPagePath(windowObject.location);
    if (nextPath === lastPath) return;
    lastPath = nextPath;
    analytics.trackPageView();
  };
  const history = windowObject.history;
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function trackedPushState(...args) {
    const result = originalPushState.apply(this, args);
    onRouteChange();
    return result;
  };
  history.replaceState = function trackedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    onRouteChange();
    return result;
  };
  windowObject.addEventListener('popstate', onRouteChange);

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    windowObject.removeEventListener('popstate', onRouteChange);
  };
};
