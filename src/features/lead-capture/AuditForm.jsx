import { ArrowRight, Check, Clock, LoaderCircle, Lock, Mail, MessageCircle } from 'lucide-react';
import { CONTACT_METHODS, REVENUE_CURRENCIES, getMonthlyRevenueOptions } from '../../../shared/leadSchema.js';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { PRIMARY_AUDIT_FIRST_FIELD_ID, PRIMARY_AUDIT_FORM_ID, PRIMARY_CTA_LABEL } from './primaryCta.js';
import { ANALYTICS_EVENTS, trackAnalyticsEvent, trackContactClick } from '../../analytics/index.js';
import LegalConsent from './LegalConsent.jsx';
import AuditDetailsFields from './AuditDetailsFields.jsx';
import AuditSuccess from './AuditSuccess.jsx';
import AuditDone from './AuditDone.jsx';
import { DIAL_CODES } from './dialCodes.js';
import { errorClassName, hintClassName, inputClassName, labelClassName, optionClassName } from './formStyles.js';
import { AUDIT_STAGES, useAuditForm } from './useAuditForm.js';
import './lead-capture.css';

const getDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

const CONTACT_OPTIONS = [
  { value: CONTACT_METHODS.email, label: 'Work email', icon: <Mail className="h-4 w-4" aria-hidden="true" /> },
  { value: CONTACT_METHODS.whatsapp, label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" aria-hidden="true" /> },
];

const TRUST_POINTS = ['Free, no obligation', 'No Seller Central password needed', 'Reply on your chosen channel'];

const StepMeta = ({ label, duration }) => (
  <div className="mb-3 flex flex-wrap items-center gap-3">
    <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary-900">{label}</span>
    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {duration}
    </span>
  </div>
);

const AuditForm = ({ formLocation = 'unspecified' }) => {
  const {
    formData, details, errors, stage, status, statusMessage, isSubmitting, contactIsWhatsApp,
    submittedLead, sharedDetails, whatsappUrl, fieldIds, collectMonthlyRevenue,
    handleSubmit, markFormStarted, handleFieldChange, handleContactMethodChange,
    handleDetailsChange, toggleDetailsValue, openDetails, skipDetails,
  } = useAuditForm(formLocation);
  const isDetails = stage === AUDIT_STAGES.details;
  const trackSuccessWhatsApp = () => trackContactClick('whatsapp', 'audit_form_success');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl md:p-7">
      {stage === AUDIT_STAGES.success && (
        <AuditSuccess
          lead={submittedLead}
          onAddDetails={submittedLead.leadId ? openDetails : undefined}
          whatsappUrl={whatsappUrl}
          onWhatsAppClick={trackSuccessWhatsApp}
        />
      )}

      {stage === AUDIT_STAGES.done && (
        <AuditDone
          lead={submittedLead}
          summary={sharedDetails}
          bookingCalendarUrl={LEAD_FUNNEL_CONFIG.bookingCalendarUrl}
          onCalendarClick={() => trackAnalyticsEvent(ANALYTICS_EVENTS.calendarOpen, {
            cta_location: 'audit_form_success',
            form_location: formLocation,
            calendar_provider: 'configured_calendar',
          })}
          whatsappUrl={whatsappUrl}
          onWhatsAppClick={trackSuccessWhatsApp}
        />
      )}

      {(stage === AUDIT_STAGES.form || isDetails) && (
        <>
          {isDetails ? (
            <>
              <StepMeta label="Step 2 of 2 · Optional" duration="About 1 minute" />
              <h2 className="text-2xl font-bold tracking-tight text-amazon-dark">Help us prepare your audit</h2>
              <p className="mt-2 text-gray-600">These details let us review your store before we talk. Skip anything you&apos;re unsure about.</p>
            </>
          ) : (
            <>
              <StepMeta label="Step 1 of 2" duration="Takes about 30 seconds" />
              <h2 className="text-2xl font-bold tracking-tight text-amazon-dark">Get Your Free Amazon Growth Audit</h2>
              <p className="mt-2 text-gray-600">Share your contact details and revenue range. We&apos;ll help identify opportunities to improve your Amazon visibility, conversion and sales.</p>
            </>
          )}

          <form
            id={PRIMARY_AUDIT_FORM_ID}
            method="post"
            onSubmit={handleSubmit}
            className="mt-5 scroll-mt-24 space-y-4"
            aria-busy={isSubmitting}
            onFocusCapture={markFormStarted}
            data-clarity-mask="true"
            noValidate
          >
            {statusMessage && (
              <div
                role={status === 'error' ? 'alert' : 'status'}
                aria-live={status === 'error' ? 'assertive' : 'polite'}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                  status === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-primary-200 bg-primary-50 text-primary-900'
                }`}
              >
                {statusMessage}
              </div>
            )}

            {isDetails ? (
              <AuditDetailsFields
                details={details}
                errors={errors}
                revenueCurrency={submittedLead?.revenueCurrency || formData.revenueCurrency}
                onChange={handleDetailsChange}
                onToggle={toggleDetailsValue}
              />
            ) : (
              <>
                <div>
                  <label htmlFor={PRIMARY_AUDIT_FIRST_FIELD_ID} className={labelClassName}>
                    Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text"
                    id={PRIMARY_AUDIT_FIRST_FIELD_ID}
                    name="name"
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    required
                    value={formData.name}
                    onChange={handleFieldChange}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'primary-audit-name-error' : undefined}
                    className={inputClassName(errors.name)}
                  />
                  {errors.name && (
                    <p id="primary-audit-name-error" className={errorClassName}>{errors.name}</p>
                  )}
                </div>

                <fieldset>
                  <legend className={labelClassName}>
                    Work email or WhatsApp number <span aria-hidden="true">*</span>
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {CONTACT_OPTIONS.map(({ value, label, icon }) => (
                      <label key={value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value={value}
                          checked={formData.contactMethod === value}
                          onChange={handleContactMethodChange}
                          className="peer sr-only"
                        />
                        <span className={optionClassName}>
                          {icon}
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className={contactIsWhatsApp ? 'mt-2 flex gap-2' : undefined}>
                    {contactIsWhatsApp && (
                      <>
                        <label htmlFor="primary-audit-dial-code" className="sr-only">Country code</label>
                        <select
                          id="primary-audit-dial-code"
                          name="dialCode"
                          value={formData.dialCode}
                          onChange={handleFieldChange}
                          autoComplete="tel-country-code"
                          className="w-28 shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-3 font-semibold text-gray-900 shadow-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/30"
                        >
                          {DIAL_CODES.map((dial) => (
                            <option key={dial.country} value={dial.code}>
                              {dial.code ? `${dial.flag} ${dial.code}` : `${dial.flag} Other`}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    <label htmlFor={fieldIds.contact} className="sr-only">
                      {contactIsWhatsApp ? 'WhatsApp number' : 'Work email'}
                    </label>
                    <input
                      type={contactIsWhatsApp ? 'tel' : 'email'}
                      inputMode={contactIsWhatsApp ? 'tel' : 'email'}
                      id={fieldIds.contact}
                      name="contact"
                      autoComplete={contactIsWhatsApp ? (formData.dialCode ? 'tel-national' : 'tel') : 'email'}
                      autoCapitalize="none"
                      spellCheck="false"
                      enterKeyHint="next"
                      required
                      placeholder={contactIsWhatsApp ? (formData.dialCode ? '97924 20796' : '+971 50 123 4567') : 'you@yourbrand.com'}
                      value={formData.contact}
                      onChange={handleFieldChange}
                      aria-invalid={Boolean(errors.contact)}
                      aria-describedby={getDescribedBy(
                        contactIsWhatsApp ? 'primary-audit-contact-hint' : '',
                        errors.contact ? 'primary-audit-contact-error' : '',
                      )}
                      className={inputClassName(errors.contact, { inline: contactIsWhatsApp })}
                    />
                  </div>
                  {contactIsWhatsApp && (
                    <p id="primary-audit-contact-hint" className={hintClassName}>
                      {formData.dialCode
                        ? 'We’ll message you on WhatsApp — no spam, ever.'
                        : 'Include your country code, for example +971.'}
                    </p>
                  )}
                  {errors.contact && (
                    <p id="primary-audit-contact-error" className={errorClassName}>{errors.contact}</p>
                  )}
                </fieldset>

                {collectMonthlyRevenue && (
                  <div className="space-y-4">
                    <fieldset aria-describedby={errors.revenueCurrency ? 'primary-audit-currency-error' : undefined}>
                      <legend className={labelClassName}>Revenue currency <span aria-hidden="true">*</span></legend>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {REVENUE_CURRENCIES.map(currency => (
                          <label key={currency.code} className="relative cursor-pointer">
                            <input
                              type="radio"
                              id={`primary-audit-currency-${currency.code.toLowerCase()}`}
                              name="revenueCurrency"
                              value={currency.code}
                              checked={formData.revenueCurrency === currency.code}
                              onChange={handleFieldChange}
                              required
                              aria-invalid={Boolean(errors.revenueCurrency)}
                              aria-describedby={errors.revenueCurrency ? 'primary-audit-currency-error' : undefined}
                              className="peer sr-only"
                            />
                            <span className={optionClassName}>
                              <span aria-hidden="true">{currency.symbol}</span>{currency.code}<span className="sr-only"> — {currency.label}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.revenueCurrency && <p id="primary-audit-currency-error" className={errorClassName}>{errors.revenueCurrency}</p>}
                    </fieldset>
                    <div>
                      <label htmlFor={fieldIds.monthlyRevenue} className={labelClassName}>
                        Monthly Amazon revenue range <span aria-hidden="true">*</span>
                      </label>
                      <select
                        id={fieldIds.monthlyRevenue}
                        name="monthlyRevenue"
                        required
                        value={formData.monthlyRevenue}
                        onChange={handleFieldChange}
                        aria-invalid={Boolean(errors.monthlyRevenue)}
                        aria-describedby={getDescribedBy('primary-audit-monthly-revenue-hint', errors.monthlyRevenue ? 'primary-audit-monthly-revenue-error' : '')}
                        className={inputClassName(errors.monthlyRevenue)}
                      >
                        <option value="">Select the closest range</option>
                        {getMonthlyRevenueOptions(formData.revenueCurrency).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <p id="primary-audit-monthly-revenue-hint" className={hintClassName} aria-live="polite">
                        Select your approximate monthly revenue in {formData.revenueCurrency}. Choose a new range when switching currencies.
                      </p>
                      {errors.monthlyRevenue && <p id="primary-audit-monthly-revenue-error" className={errorClassName}>{errors.monthlyRevenue}</p>}
                    </div>
                  </div>
                )}
              </>
            )}

            <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="primary-audit-website">Leave this field blank</label>
              <input
                type="text"
                id="primary-audit-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleFieldChange}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Sending securely…
                </>
              ) : (
                <>
                  {isDetails ? 'Send details' : PRIMARY_CTA_LABEL}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>

            {isDetails ? (
              <>
                <button
                  type="button"
                  onClick={skipDetails}
                  disabled={isSubmitting}
                  className="mx-auto block min-h-11 rounded-lg px-3 text-sm font-semibold text-gray-600 underline underline-offset-4 hover:text-amazon-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                >
                  Skip for now
                </button>
                <p className="flex gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                  We never ask for your Seller Central password. If we need access later, we&apos;ll request a limited user permission through Amazon.
                </p>
              </>
            ) : (
              <>
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-gray-700">
                  {TRUST_POINTS.map(point => (
                    <li key={point} className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <LegalConsent className="pt-1 text-gray-600" />
              </>
            )}
          </form>

          {!isDetails && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContactClick('whatsapp', `${formLocation}_form_secondary`)}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Contact us on WhatsApp instead
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default AuditForm;
