import { trackPrimaryCtaClick } from '../../analytics/index.js';
import {
  CRO_DEFAULTS,
  CRO_EXPERIMENT_IDS,
  getCroValue,
} from '../../experiments/index.js';

export const PRIMARY_AUDIT_FORM_ID = 'primary-audit-form';
export const PRIMARY_AUDIT_FIRST_FIELD_ID = 'primary-audit-name';
export const PRIMARY_AUDIT_FORM_REGION_ID = 'primary-audit-form-region';
export const PRIMARY_AUDIT_ROUTE = `/contact#${PRIMARY_AUDIT_FORM_ID}`;
export const PRIMARY_AUDIT_FORM_GATE_ATTRIBUTE = 'data-primary-audit-form-gate';
export const PRIMARY_AUDIT_FORM_REVEAL_EVENT = 'digital-universe:reveal-audit-form';
export const PRIMARY_CTA_LABEL = getCroValue(
  CRO_EXPERIMENT_IDS.primaryCtaCopy,
  'label',
  CRO_DEFAULTS.primaryCtaLabel,
);
export const SECONDARY_CTA_LABEL = 'Explore Our Services';
export const SECONDARY_CTA_HREF = '#services';

export const prefersReducedMotion = (windowObject = globalThis.window) =>
  Boolean(windowObject?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export const getScrollBehavior = (windowObject = globalThis.window) =>
  prefersReducedMotion(windowObject) ? 'auto' : 'smooth';

export const scrollToElement = (
  elementId,
  { documentObject = globalThis.document, windowObject = globalThis.window } = {},
) => {
  const element = documentObject?.getElementById?.(elementId);

  if (!element) return false;

  element.scrollIntoView({
    behavior: getScrollBehavior(windowObject),
    block: 'start',
  });

  return true;
};

export const focusPrimaryAuditForm = ({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
} = {}) => {
  const form = documentObject?.getElementById?.(PRIMARY_AUDIT_FORM_ID);
  const firstField = documentObject?.getElementById?.(PRIMARY_AUDIT_FIRST_FIELD_ID);

  if (!form || !firstField) return false;

  form.scrollIntoView({
    behavior: getScrollBehavior(windowObject),
    block: 'start',
  });
  firstField.focus({ preventScroll: true });

  return true;
};

export const focusPrimaryAuditFormFromHash = ({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
} = {}) => {
  if (windowObject?.location?.hash !== `#${PRIMARY_AUDIT_FORM_ID}`) return false;
  return focusPrimaryAuditForm({ documentObject, windowObject });
};

export const activatePrimaryAuditForm = ({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  ctaLocation = 'unspecified',
  service,
} = {}) => {
  const focused = focusPrimaryAuditForm({ documentObject, windowObject });
  const formGate = documentObject?.documentElement?.getAttribute?.(
    PRIMARY_AUDIT_FORM_GATE_ATTRIBUTE,
  ) === 'true';

  if (!focused && !formGate) return false;
  if (!focused) {
    const CustomEventConstructor = windowObject?.CustomEvent ?? globalThis.CustomEvent;
    if (!CustomEventConstructor || !documentObject?.dispatchEvent) return false;
    documentObject.dispatchEvent(new CustomEventConstructor(PRIMARY_AUDIT_FORM_REVEAL_EVENT));
  }
  trackPrimaryCtaClick({ ctaLocation, service, ctaLabel: PRIMARY_CTA_LABEL });

  return true;
};

export const scrollToPageTop = (windowObject = globalThis.window) => {
  if (!windowObject?.scrollTo) return false;

  windowObject.scrollTo({ top: 0, behavior: getScrollBehavior(windowObject) });
  return true;
};
