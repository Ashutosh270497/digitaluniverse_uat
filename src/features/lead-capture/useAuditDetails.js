import { useRef, useState } from 'react';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { describeLeadDetails, validateLeadDetailsPayload } from '../../../shared/leadSchema.js';
import { LeadSubmissionError, submitLeadRequest } from './submitLead.js';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '../../analytics/index.js';

export const detailFieldIds = {
  storeUrl: 'audit-details-store',
  marketplaces: 'audit-details-marketplace-in',
  sellerType: 'audit-details-seller-brand-owner',
  adSpend: 'audit-details-ad-spend',
  challenges: 'audit-details-challenge-ppc',
  notes: 'audit-details-notes',
};

const createInitialDetails = () => ({
  storeUrl: '',
  marketplaces: [],
  sellerType: '',
  adSpend: '',
  challenges: [],
  notes: '',
  website: '',
});

// Optional Step 2 on /thank-you: sent as a follow-up that references the lead ID.
export const useAuditDetails = (lead) => {
  const [details, setDetails] = useState(createInitialDetails);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [sharedDetails, setSharedDetails] = useState(null);
  const [startedAt] = useState(() => Date.now());
  const attemptRef = useRef(0);
  const formLocation = lead?.formLocation ?? 'unspecified';
  const isSubmitting = status === 'submitting';

  const clearError = (name) => {
    setErrors((current) => (current[name] || current.details ? { ...current, [name]: '', details: '' } : current));
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('');
    }
  };

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
    clearError(name);
  };

  const toggleDetailsValue = (name, value) => {
    setDetails((current) => ({
      ...current,
      [name]: current[name].includes(value)
        ? current[name].filter((item) => item !== value)
        : [...current[name], value],
    }));
    clearError(name);
  };

  const focusFirstInvalid = (fieldErrors) => {
    const first = Object.keys(detailFieldIds).find((name) => fieldErrors[name]);
    if (first) globalThis.requestAnimationFrame?.(() => globalThis.document?.getElementById(detailFieldIds[first])?.focus());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const attempt = ++attemptRef.current;
    const validation = validateLeadDetailsPayload({
      ...details,
      leadId: lead?.leadId,
      name: lead?.name,
      email: lead?.email,
      whatsapp: lead?.whatsapp,
      revenueCurrency: lead?.revenueCurrency,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      setStatus('error');
      setStatusMessage(validation.errors.details || validation.errors.leadId || 'Please correct the highlighted fields.');
      focusFirstInvalid(validation.errors);
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
        payload: { stage: 'details', ...validation.data, website: details.website, startedAt },
      });
      setSharedDetails(describeLeadDetails(validation.data));
      setStatus('sent');
      setStatusMessage('');
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditDetailsSuccess,
        { form_location: formLocation },
        { dedupeKey: `audit_details_success:${formLocation}:${attempt}` },
      );
    } catch (error) {
      const submissionError = error instanceof LeadSubmissionError
        ? error
        : new LeadSubmissionError('We could not send your details. Please try again or use WhatsApp.');
      setErrors(submissionError.fieldErrors);
      setStatus('error');
      setStatusMessage(submissionError.message);
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.auditFormFailure,
        { form_location: formLocation, http_status: submissionError.status, error_fields: Object.keys(submissionError.fieldErrors) },
        { dedupeKey: `audit_details_failure:${formLocation}:${attempt}` },
      );
      focusFirstInvalid(submissionError.fieldErrors);
    }
  };

  const skipDetails = () => {
    setStatus('skipped');
    setStatusMessage('');
    trackAnalyticsEvent(ANALYTICS_EVENTS.auditDetailsSkip, { form_location: formLocation });
  };

  return {
    details, errors, status, statusMessage, isSubmitting, sharedDetails,
    handleSubmit, handleDetailsChange, toggleDetailsValue, skipDetails,
  };
};
