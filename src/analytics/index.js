import { ANALYTICS_CONFIG } from './config.js';
import { createAnalytics, installSpaRouteTracking } from './analytics.js';
import { ANALYTICS_EVENTS } from './events.js';
import { createConfiguredProviders } from './providers.js';
import {
  getCroAnalyticsContext,
  initializeCroExperiments,
} from '../experiments/index.js';

export { ANALYTICS_CONFIG } from './config.js';
export { ANALYTICS_CONSENT } from './analytics.js';
export { ANALYTICS_EVENTS } from './events.js';

export const ANALYTICS_PREFERENCES_EVENT = 'digital-universe:analytics-preferences';
export const CALENDAR_BOOKED_EVENT = 'digital-universe:calendar-booked';

const providers = createConfiguredProviders({
  config: ANALYTICS_CONFIG.providers,
  windowObject: globalThis.window,
  documentObject: globalThis.document,
});

export const analytics = createAnalytics({
  config: ANALYTICS_CONFIG,
  providers,
  getDefaultContext: getCroAnalyticsContext,
});

let stopRouteTracking = null;

export const startAnalytics = () => {
  initializeCroExperiments();
  const initialized = analytics.initialize();
  if (!initialized) return false;

  analytics.trackPageView();
  stopRouteTracking = installSpaRouteTracking({ analytics });
  globalThis.window?.addEventListener?.(CALENDAR_BOOKED_EVENT, (event) => {
    analytics.track(
      ANALYTICS_EVENTS.calendarBooked,
      event.detail ?? {},
      { dedupeKey: event.detail?.dedupeKey },
    );
  });
  return true;
};

export const stopAnalyticsRouteTracking = () => {
  stopRouteTracking?.();
  stopRouteTracking = null;
};

export const trackAnalyticsEvent = (name, context, options) =>
  analytics.track(name, context, options);

export const setAnalyticsConsent = (consent) => analytics.setConsent(consent);

export const openAnalyticsPreferences = () => {
  const CustomEventConstructor = globalThis.CustomEvent;
  if (!CustomEventConstructor) return false;
  globalThis.window?.dispatchEvent?.(new CustomEventConstructor(ANALYTICS_PREFERENCES_EVENT));
  return true;
};

export const trackPrimaryCtaClick = ({ ctaLocation, service, ctaLabel } = {}) =>
  trackAnalyticsEvent(ANALYTICS_EVENTS.primaryCtaClick, {
    cta_label: ctaLabel ?? 'Request My Free Amazon Audit',
    cta_location: ctaLocation,
    service,
  });

export const trackSecondaryCtaClick = ({ ctaLocation, ctaLabel = 'Explore Our Services', service } = {}) =>
  trackAnalyticsEvent(ANALYTICS_EVENTS.secondaryCtaClick, {
    cta_label: ctaLabel,
    cta_location: ctaLocation,
    service,
  });

export const trackContactClick = (type, ctaLocation) => {
  const eventName = {
    email: ANALYTICS_EVENTS.emailClick,
    phone: ANALYTICS_EVENTS.phoneClick,
    whatsapp: ANALYTICS_EVENTS.whatsappClick,
  }[type];

  return eventName
    ? trackAnalyticsEvent(eventName, { cta_location: ctaLocation })
    : false;
};

export const trackCalendarBooked = (context = {}) =>
  trackAnalyticsEvent(ANALYTICS_EVENTS.calendarBooked, context, {
    dedupeKey: context.dedupeKey,
  });
