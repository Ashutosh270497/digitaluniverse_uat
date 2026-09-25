export const ANALYTICS_EVENTS = Object.freeze({
  pageView: 'page_view',
  primaryCtaClick: 'primary_cta_click',
  secondaryCtaClick: 'secondary_cta_click',
  auditFormStart: 'audit_form_start',
  auditFormValidationError: 'audit_form_validation_error',
  auditFormSubmit: 'audit_form_submit',
  auditFormSuccess: 'audit_form_success',
  auditFormFailure: 'audit_form_failure',
  calendarOpen: 'calendar_open',
  calendarBooked: 'calendar_booked',
  whatsappClick: 'whatsapp_click',
  caseStudyView: 'case_study_view',
  serviceView: 'service_view',
  faqOpen: 'faq_open',
  emailClick: 'email_click',
  phoneClick: 'phone_click',
});

export const ANALYTICS_EVENT_NAMES = Object.freeze(Object.values(ANALYTICS_EVENTS));

export const UTM_KEYS = Object.freeze([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
]);

const ALLOWED_CONTEXT_KEYS = new Set([
  'page_path',
  'page_title',
  'cta_label',
  'cta_location',
  'service',
  'case_study_id',
  'device_category',
  'form_location',
  'faq_id',
  'error_fields',
  'error_count',
  'failure_reason',
  'http_status',
  'calendar_provider',
  'experiment_id',
  'experiment_variant',
  ...UTM_KEYS,
]);

const STRING_LIMIT = 120;
const PAGE_PATH_LIMIT = 240;

const sanitizeString = (value, limit = STRING_LIMIT) => {
  if (typeof value !== 'string') return null;
  const sanitized = [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint > 31 && codePoint !== 127;
    })
    .join('')
    .trim();
  return sanitized ? sanitized.slice(0, limit) : null;
};

const sanitizeNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const sanitizeErrorFields = (value) => {
  if (!Array.isArray(value)) return null;

  const fields = value
    .filter((field) => typeof field === 'string')
    .map((field) => field.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40))
    .filter(Boolean)
    .slice(0, 10);

  return fields.length ? fields : null;
};

export const getDeviceCategory = (windowObject = globalThis.window) => {
  const width = windowObject?.innerWidth;
  if (!Number.isFinite(width)) return 'unknown';
  if (width < 768) return 'mobile';
  if (width < 1280) return 'tablet';
  return 'desktop';
};

export const getPagePath = (locationObject = globalThis.location) => {
  const pathname = sanitizeString(locationObject?.pathname, PAGE_PATH_LIMIT) ?? '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

export const captureUtmAttribution = (locationObject = globalThis.location) => {
  const search = typeof locationObject?.search === 'string' ? locationObject.search : '';
  const params = new URLSearchParams(search);

  return Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = sanitizeString(params.get(key));
      return value ? [[key, value]] : [];
    }),
  );
};

export const sanitizeAnalyticsContext = (context = {}) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(context)) {
    if (!ALLOWED_CONTEXT_KEYS.has(key)) continue;

    let nextValue;
    if (key === 'error_fields') nextValue = sanitizeErrorFields(value);
    else if (key === 'error_count' || key === 'http_status') nextValue = sanitizeNumber(value);
    else nextValue = sanitizeString(value, key === 'page_path' ? PAGE_PATH_LIMIT : STRING_LIMIT);

    if (nextValue !== null) sanitized[key] = nextValue;
  }

  return sanitized;
};
