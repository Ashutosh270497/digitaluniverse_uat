import { useEffect, useRef, useState } from 'react';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { SITE_CONFIG, getWhatsAppUrl } from '../../config/site.js';
import { THANK_YOU_ROUTE } from '../../config/routes.js';
import {
  getMonthlyRevenueOptions,
  validateLeadPayload,
} from '../../../shared/leadSchema.js';
import { LeadSubmissionError, submitLeadRequest } from './submitLead.js';
import { DEFAULT_DIAL_CODE, composeWhatsAppNumber } from './dialCodes.js';
import { saveThankYouHandoff } from './thankYouHandoff.js';
import {
  PRIMARY_AUDIT_FIRST_FIELD_ID,
  PRIMARY_AUDIT_FORM_ID,
  focusPrimaryAuditFormFromHash,
} from './primaryCta.js';
import {
  ANALYTICS_EVENTS,
  trackAnalyticsEvent,
} from '../../analytics/index.js';
import {
  CRO_EXPERIMENT_IDS,
  getCroLeadContext,
  getCroValue,
} from '../../experiments/index.js';

const fieldIds = {
  name: PRIMARY_AUDIT_FIRST_FIELD_ID,
  email: 'primary-audit-email',
  whatsapp: 'primary-audit-whatsapp',
  revenueCurrency: 'primary-audit-currency-usd',
  monthlyRevenue: 'primary-audit-monthly-revenue',
};

const collectMonthlyRevenue = getCroValue(
  CRO_EXPERIMENT_IDS.revenueRangeField,
  'collectMonthlyRevenue',
  true,
);

const createInitialFormData = () => ({
  name: '',
  email: '',
  whatsapp: '',
  dialCode: DEFAULT_DIAL_CODE,
  revenueCurrency: 'USD',
  monthlyRevenue: '',
  website: '',
  startedAt: Date.now(),
});

const getFailureReason = (status) => (status === 429
  ? 'rate_limited'
  : status >= 500
    ? 'server_error'
    : status >= 400
      ? 'request_rejected'
      : 'network_or_configuration_error');

const goToThankYouPage = () => globalThis.location?.assign(THANK_YOU_ROUTE);

export const useAuditForm = (formLocation, { onDelivered = goToThankYouPage } = {}) => {
  const [formData, setFormData] = useState(createInitialFormData);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [deliveryFailed, setDeliveryFailed] = useState(false);
  const formStartedRef = useRef(false);
  const submissionAttemptRef = useRef(0);

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';
  const whatsappUrl = getWhatsAppUrl(`Hello, I would like to discuss a free Amazon audit with ${SITE_CONFIG.brandName}.`);

  useEffect(() => {
    if (globalThis.window?.location?.hash !== `#${PRIMARY_AUDIT_FORM_ID}`) return undefined;

    const frame = globalThis.requestAnimationFrame?.(() => {
      focusPrimaryAuditFormFromHash();
    });

    return () => {
      if (frame !== undefined) globalThis.cancelAnimationFrame?.(frame);
    };
  }, []);

  const markFormStarted = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackAnalyticsEvent(
      ANALYTICS_EVENTS.auditFormStart,
      { form_location: formLocation },
      { dedupeKey: `audit_form_start:${formLocation}`, dedupeWindowMs: 30 * 60 * 1_000 },
    );
  };

  const clearFieldError = (name) => {
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'revenueCurrency' ? { monthlyRevenue: current.monthlyRevenue === 'not-selling-yet' ? current.monthlyRevenue : '' } : {}),
    }));
    if (name === 'revenueCurrency') clearFieldError('monthlyRevenue');
    clearFieldError(name === 'dialCode' ? 'whatsapp' : name);
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('');
      setDeliveryFailed(false);
    }
  };

  const focusFirstInvalidField = (fieldErrors) => {
    const firstInvalidField = Object.keys(fieldIds).find((name) => fieldErrors[name]);
    if (!firstInvalidField) return;

    globalThis.requestAnimationFrame?.(() => {
      globalThis.document?.getElementById(fieldIds[firstInvalidField])?.focus();
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    markFormStarted();
    const attempt = ++submissionAttemptRef.current;
    const validation = validateLeadPayload({
      ...formData,
      whatsapp: composeWhatsAppNumber(formData.dialCode, formData.whatsapp),
    }, { requireMonthlyRevenue: collectMonthlyRevenue });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setStatus('error');
      setStatusMessage('Please correct the highlighted fields.');
      setDeliveryFailed(false);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormValidationError,
        {
          form_location: formLocation,
          error_fields: Object.keys(validation.errors),
          error_count: Object.keys(validation.errors).length,
        },
        { dedupeKey: `audit_form_validation_error:${formLocation}:${attempt}` },
      );
      focusFirstInvalidField(validation.errors);
      return;
    }

    setErrors({});
    setStatus('submitting');
    setStatusMessage('Sending your audit request securely…');
    setDeliveryFailed(false);
    trackAnalyticsEvent(
      ANALYTICS_EVENTS.auditFormSubmit,
      { form_location: formLocation },
      { dedupeKey: `audit_form_submit:${formLocation}:${attempt}` },
    );

    try {
      const result = await submitLeadRequest({
        endpoint: LEAD_FUNNEL_CONFIG.apiUrl,
        payload: {
          ...validation.data,
          ...getCroLeadContext(),
          formLocation,
          website: formData.website,
          startedAt: formData.startedAt,
        },
      });

      saveThankYouHandoff({
        name: validation.data.name,
        email: validation.data.email,
        whatsapp: validation.data.whatsapp,
        leadId: typeof result.leadId === 'string' ? result.leadId : '',
        revenueCurrency: validation.data.revenueCurrency,
        revenueLabel: getMonthlyRevenueOptions(validation.data.revenueCurrency)
          .find((option) => option.value === validation.data.monthlyRevenue && option.value !== 'not-selling-yet')?.label ?? '',
        formLocation,
      });
      setStatus('success');
      setStatusMessage('Request received. Taking you to your confirmation…');
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormSuccess,
        { form_location: formLocation },
        { dedupeKey: `audit_form_success:${formLocation}:${attempt}` },
      );
      onDelivered();
    } catch (error) {
      const submissionError = error instanceof LeadSubmissionError
        ? error
        : new LeadSubmissionError('We could not send your request. Please try again or use WhatsApp.');
      setErrors(submissionError.fieldErrors);
      setStatus('error');
      setStatusMessage(submissionError.message);
      setDeliveryFailed(Object.keys(submissionError.fieldErrors).length === 0);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormFailure,
        {
          form_location: formLocation,
          failure_reason: getFailureReason(submissionError.status),
          http_status: submissionError.status,
          error_fields: Object.keys(submissionError.fieldErrors),
        },
        { dedupeKey: `audit_form_failure:${formLocation}:${attempt}` },
      );
      focusFirstInvalidField(submissionError.fieldErrors);
    }
  };

  return {
    formData, errors, status, statusMessage, isSubmitting, isSuccess, deliveryFailed,
    whatsappUrl, fieldIds, collectMonthlyRevenue, handleSubmit, markFormStarted, handleFieldChange,
  };
};
