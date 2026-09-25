import { useEffect, useRef, useState } from 'react';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { getWhatsAppUrl } from '../../config/site.js';
import {
  CONTACT_METHODS,
  validateLeadPayload,
} from '../../../shared/leadSchema.js';
import { LeadSubmissionError, submitLeadRequest } from './submitLead.js';
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
  contact: 'primary-audit-contact',
  amazonUrl: 'primary-audit-amazon-url',
  monthlyRevenue: 'primary-audit-monthly-revenue',
};

const collectMonthlyRevenue = getCroValue(
  CRO_EXPERIMENT_IDS.revenueRangeField,
  'collectMonthlyRevenue',
  true,
);

const createInitialFormData = () => ({
  name: '',
  contactMethod: CONTACT_METHODS.email,
  contact: '',
  amazonUrl: '',
  monthlyRevenue: '',
  website: '',
  startedAt: Date.now(),
});

export const useAuditForm = (formLocation) => {
  const [formData, setFormData] = useState(createInitialFormData);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const formStartedRef = useRef(false);
  const submissionAttemptRef = useRef(0);

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';
  const contactIsWhatsApp = formData.contactMethod === CONTACT_METHODS.whatsapp;
  const whatsappUrl = getWhatsAppUrl(
    'Hello, I would like to discuss a free Amazon audit with Digital Universe Pro.',
  );

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
    setFormData((current) => ({ ...current, [name]: value }));
    clearFieldError(name);
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('');
    }
  };

  const handleContactMethodChange = (event) => {
    setFormData((current) => ({
      ...current,
      contactMethod: event.target.value,
      contact: '',
    }));
    clearFieldError('contact');
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

    const validation = validateLeadPayload(formData, {
      requireMonthlyRevenue: collectMonthlyRevenue,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      setStatus('error');
      setStatusMessage('Please correct the highlighted fields.');
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
          website: formData.website,
          startedAt: formData.startedAt,
        },
      });

      setStatus('success');
      setStatusMessage(result.message);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormSuccess,
        { form_location: formLocation },
        { dedupeKey: `audit_form_success:${formLocation}:${attempt}` },
      );
    } catch (error) {
      const submissionError = error instanceof LeadSubmissionError
        ? error
        : new LeadSubmissionError('We could not send your request. Please try again or use WhatsApp.');
      setErrors(submissionError.fieldErrors);
      setStatus('error');
      setStatusMessage(submissionError.message);
      const failureReason = submissionError.status === 429
        ? 'rate_limited'
        : submissionError.status >= 500
          ? 'server_error'
          : submissionError.status >= 400
            ? 'request_rejected'
            : 'network_or_configuration_error';
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormFailure,
        {
          form_location: formLocation,
          failure_reason: failureReason,
          http_status: submissionError.status,
          error_fields: Object.keys(submissionError.fieldErrors),
        },
        { dedupeKey: `audit_form_failure:${formLocation}:${attempt}` },
      );
      focusFirstInvalidField(submissionError.fieldErrors);
    }
  };

  return {
    formData, errors, status, statusMessage, isSubmitting, isSuccess, contactIsWhatsApp,
    whatsappUrl, fieldIds, collectMonthlyRevenue, handleSubmit, markFormStarted,
    handleFieldChange, handleContactMethodChange,
  };
};
