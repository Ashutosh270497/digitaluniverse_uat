import { useEffect, useRef, useState } from 'react';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { SITE_CONFIG, getWhatsAppUrl } from '../../config/site.js';
import {
  CONTACT_METHODS,
  describeLeadDetails,
  getMonthlyRevenueOptions,
  validateLeadDetailsPayload,
  validateLeadPayload,
} from '../../../shared/leadSchema.js';
import { LeadSubmissionError, submitLeadRequest } from './submitLead.js';
import { DEFAULT_DIAL_CODE, composeWhatsAppNumber } from './dialCodes.js';
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

// Visitors move form → success → (optional) details → done.
export const AUDIT_STAGES = Object.freeze({
  form: 'form',
  success: 'success',
  details: 'details',
  done: 'done',
});

const fieldIds = {
  name: PRIMARY_AUDIT_FIRST_FIELD_ID,
  contact: 'primary-audit-contact',
  revenueCurrency: 'primary-audit-currency-usd',
  monthlyRevenue: 'primary-audit-monthly-revenue',
};

export const detailFieldIds = {
  storeUrl: 'audit-details-store',
  marketplaces: 'audit-details-marketplace-in',
  sellerType: 'audit-details-seller-brand-owner',
  adSpend: 'audit-details-ad-spend',
  challenges: 'audit-details-challenge-ppc',
  notes: 'audit-details-notes',
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
  dialCode: DEFAULT_DIAL_CODE,
  revenueCurrency: 'USD',
  monthlyRevenue: '',
  website: '',
  startedAt: Date.now(),
});

const createInitialDetails = () => ({
  storeUrl: '',
  marketplaces: [],
  sellerType: '',
  adSpend: '',
  challenges: [],
  notes: '',
});

const getFailureReason = (status) => (status === 429
  ? 'rate_limited'
  : status >= 500
    ? 'server_error'
    : status >= 400
      ? 'request_rejected'
      : 'network_or_configuration_error');

const focusFirstInvalid = (ids, fieldErrors) => {
  const firstInvalidField = Object.keys(ids).find((name) => fieldErrors[name]);
  if (!firstInvalidField) return;

  globalThis.requestAnimationFrame?.(() => {
    globalThis.document?.getElementById(ids[firstInvalidField])?.focus();
  });
};

export const useAuditForm = (formLocation) => {
  const [formData, setFormData] = useState(createInitialFormData);
  const [details, setDetails] = useState(createInitialDetails);
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState(AUDIT_STAGES.form);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [submittedLead, setSubmittedLead] = useState(null);
  const [sharedDetails, setSharedDetails] = useState(null);
  const formStartedRef = useRef(false);
  const submissionAttemptRef = useRef(0);

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';
  const contactIsWhatsApp = formData.contactMethod === CONTACT_METHODS.whatsapp;
  const whatsappUrl = getWhatsAppUrl(submittedLead
    ? [
      `Hello ${SITE_CONFIG.brandName}, I just requested a free Amazon audit`,
      submittedLead.leadId ? ` (${submittedLead.leadId})` : '',
      `. My name is ${submittedLead.name}`,
      submittedLead.revenueLabel ? ` and our monthly Amazon revenue is ${submittedLead.revenueLabel}` : '',
      '.',
    ].join('')
    : `Hello, I would like to discuss a free Amazon audit with ${SITE_CONFIG.brandName}.`);

  useEffect(() => {
    if (globalThis.window?.location?.hash !== `#${PRIMARY_AUDIT_FORM_ID}`) return undefined;

    const frame = globalThis.requestAnimationFrame?.(() => {
      focusPrimaryAuditFormFromHash();
    });

    return () => {
      if (frame !== undefined) globalThis.cancelAnimationFrame?.(frame);
    };
  }, []);

  useEffect(() => {
    if (stage === AUDIT_STAGES.details) globalThis.document?.getElementById(detailFieldIds.storeUrl)?.focus();
  }, [stage]);

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

  const resetStatusAfterEdit = () => {
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('');
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'revenueCurrency' ? { monthlyRevenue: current.monthlyRevenue === 'not-selling-yet' ? current.monthlyRevenue : '' } : {}),
    }));
    if (name === 'revenueCurrency') clearFieldError('monthlyRevenue');
    clearFieldError(name === 'dialCode' ? 'contact' : name);
    resetStatusAfterEdit();
  };

  const handleContactMethodChange = (event) => {
    setFormData((current) => ({
      ...current,
      contactMethod: event.target.value,
      contact: '',
    }));
    clearFieldError('contact');
  };

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
    clearFieldError(name);
    clearFieldError('details');
    resetStatusAfterEdit();
  };

  const toggleDetailsValue = (name, value) => {
    setDetails((current) => ({
      ...current,
      [name]: current[name].includes(value)
        ? current[name].filter((item) => item !== value)
        : [...current[name], value],
    }));
    clearFieldError(name);
    clearFieldError('details');
    resetStatusAfterEdit();
  };

  const failWith = (submissionError, eventName, attempt, ids) => {
    setErrors(submissionError.fieldErrors);
    setStatus('error');
    setStatusMessage(submissionError.message);
    trackAnalyticsEvent(
      eventName,
      {
        form_location: formLocation,
        failure_reason: getFailureReason(submissionError.status),
        http_status: submissionError.status,
        error_fields: Object.keys(submissionError.fieldErrors),
      },
      { dedupeKey: `${eventName}:${formLocation}:${attempt}` },
    );
    focusFirstInvalid(ids, submissionError.fieldErrors);
  };

  const asSubmissionError = (error) => (error instanceof LeadSubmissionError
    ? error
    : new LeadSubmissionError('We could not send your request. Please try again or use WhatsApp.'));

  const submitLead = async () => {
    markFormStarted();
    const attempt = ++submissionAttemptRef.current;
    const contact = contactIsWhatsApp
      ? composeWhatsAppNumber(formData.dialCode, formData.contact)
      : formData.contact;

    const validation = validateLeadPayload({ ...formData, contact }, {
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
      focusFirstInvalid(fieldIds, validation.errors);
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
          formLocation,
          website: formData.website,
          startedAt: formData.startedAt,
        },
      });

      setSubmittedLead({
        ...validation.data,
        leadId: typeof result.leadId === 'string' ? result.leadId : '',
        revenueLabel: getMonthlyRevenueOptions(validation.data.revenueCurrency)
          .find((option) => option.value === validation.data.monthlyRevenue && option.value !== 'not-selling-yet')?.label ?? '',
      });
      setStatus('success');
      setStatusMessage(result.message);
      setStage(AUDIT_STAGES.success);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormSuccess,
        { form_location: formLocation },
        { dedupeKey: `audit_form_success:${formLocation}:${attempt}` },
      );
    } catch (error) {
      failWith(asSubmissionError(error), ANALYTICS_EVENTS.auditFormFailure, attempt, fieldIds);
    }
  };

  const submitDetails = async () => {
    const attempt = ++submissionAttemptRef.current;
    const validation = validateLeadDetailsPayload({
      ...details,
      leadId: submittedLead?.leadId,
      name: submittedLead?.name,
      contactMethod: submittedLead?.contactMethod,
      contact: submittedLead?.contact,
      revenueCurrency: submittedLead?.revenueCurrency || formData.revenueCurrency,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      setStatus('error');
      setStatusMessage(validation.errors.details || validation.errors.leadId || 'Please correct the highlighted fields.');
      focusFirstInvalid(detailFieldIds, validation.errors);
      return;
    }

    setErrors({});
    setStatus('submitting');
    setStatusMessage('Sending your audit details securely…');
    trackAnalyticsEvent(
      ANALYTICS_EVENTS.auditDetailsSubmit,
      { form_location: formLocation },
      { dedupeKey: `audit_details_submit:${formLocation}:${attempt}` },
    );

    try {
      await submitLeadRequest({
        endpoint: LEAD_FUNNEL_CONFIG.apiUrl,
        payload: {
          stage: 'details',
          ...validation.data,
          website: formData.website,
          startedAt: formData.startedAt,
        },
      });
      setSharedDetails(describeLeadDetails(validation.data));
      setStatus('success');
      setStatusMessage('');
      setStage(AUDIT_STAGES.done);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditDetailsSuccess,
        { form_location: formLocation },
        { dedupeKey: `audit_details_success:${formLocation}:${attempt}` },
      );
    } catch (error) {
      failWith(asSubmissionError(error), ANALYTICS_EVENTS.auditFormFailure, attempt, detailFieldIds);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (stage === AUDIT_STAGES.details) await submitDetails();
    else await submitLead();
  };

  const openDetails = () => {
    setErrors({});
    setStatus('idle');
    setStatusMessage('');
    setStage(AUDIT_STAGES.details);
  };

  const skipDetails = () => {
    setErrors({});
    setStatus('success');
    setStatusMessage('');
    setStage(AUDIT_STAGES.done);
    trackAnalyticsEvent(ANALYTICS_EVENTS.auditDetailsSkip, { form_location: formLocation });
  };

  return {
    formData, details, errors, stage, status, statusMessage, isSubmitting, isSuccess, contactIsWhatsApp,
    submittedLead, sharedDetails, whatsappUrl, fieldIds, collectMonthlyRevenue,
    handleSubmit, markFormStarted, handleFieldChange, handleContactMethodChange,
    handleDetailsChange, toggleDetailsValue, openDetails, skipDetails,
  };
};
