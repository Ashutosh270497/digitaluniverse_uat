const environment = import.meta.env ?? {};

const normalizeId = (value, pattern) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return pattern.test(trimmed) ? trimmed : null;
};

const parseLinkedInConversionIds = (value) => {
  if (!value) return Object.freeze({});

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return Object.freeze({});

    return Object.freeze(
      Object.fromEntries(
        Object.entries(parsed).flatMap(([eventName, conversionId]) => {
          const normalizedId = normalizeId(String(conversionId), /^\d+$/);
          return normalizedId ? [[eventName, normalizedId]] : [];
        }),
      ),
    );
  } catch {
    return Object.freeze({});
  }
};

const testMode = environment.MODE === 'test'
  || globalThis.process?.env?.NODE_ENV === 'test'
  || Boolean(globalThis.process?.env?.NODE_TEST_CONTEXT);

const developmentDebug = environment.DEV && environment.VITE_ANALYTICS_DEBUG !== 'false';

const providers = Object.freeze({
  ga4: Object.freeze({
    measurementId: normalizeId(environment.VITE_GA4_MEASUREMENT_ID, /^G-[A-Z0-9]+$/i),
  }),
  clarity: Object.freeze({
    projectId: normalizeId(environment.VITE_CLARITY_PROJECT_ID, /^[a-z0-9]+$/i),
  }),
  meta: Object.freeze({
    pixelId: normalizeId(environment.VITE_META_PIXEL_ID, /^\d+$/),
  }),
  linkedin: Object.freeze({
    partnerId: normalizeId(environment.VITE_LINKEDIN_PARTNER_ID, /^\d+$/),
    conversionIds: parseLinkedInConversionIds(
      environment.VITE_LINKEDIN_CONVERSION_IDS_JSON,
    ),
  }),
});

export const ANALYTICS_CONFIG = Object.freeze({
  testMode,
  debug: environment.VITE_ANALYTICS_DEBUG === 'true' || developmentDebug,
  enabled: Boolean(
    providers.ga4.measurementId
    || providers.clarity.projectId
    || providers.meta.pixelId
    || providers.linkedin.partnerId,
  ),
  consentStorageKey: 'dup_analytics_consent_v1',
  attributionStorageKey: 'dup_analytics_attribution_v1',
  providers,
});
