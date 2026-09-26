import { ArrowRight, CalendarDays, CheckCircle2, LoaderCircle, MessageCircle } from 'lucide-react';
import { CONTACT_METHODS, REVENUE_CURRENCIES, getMonthlyRevenueOptions } from '../../../shared/leadSchema.js';
import { LEAD_FUNNEL_CONFIG } from './config.js';
import { PRIMARY_AUDIT_FIRST_FIELD_ID, PRIMARY_AUDIT_FORM_ID, PRIMARY_CTA_LABEL } from './primaryCta.js';
import { ANALYTICS_EVENTS, trackAnalyticsEvent, trackContactClick } from '../../analytics/index.js';
import LegalConsent from './LegalConsent.jsx';
import { useAuditForm } from './useAuditForm.js';

const getDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

const AuditForm = ({ formLocation = 'unspecified' }) => {
  const {
    formData, errors, status, statusMessage, isSubmitting, isSuccess, contactIsWhatsApp,
    whatsappUrl, fieldIds, collectMonthlyRevenue, handleSubmit, markFormStarted,
    handleFieldChange, handleContactMethodChange,
  } = useAuditForm(formLocation);

  const inputClass = (hasError) => [
    'mt-2 w-full rounded-lg border bg-white px-4 py-3 font-medium text-gray-900 shadow-sm outline-none transition-colors',
    'focus:ring-2 focus:ring-primary-600/30',
    hasError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-primary-600',
  ].join(' ');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl md:p-7">
      {isSuccess ? (
        <div role="status" aria-live="polite" className="flex min-h-[32rem] flex-col justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-700" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-amazon-dark">
            We received your audit request.
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">{statusMessage}</p>
          <p className="mt-3 leading-relaxed text-gray-700">
            Next, the team will review the account details you submitted and contact you through your selected method.
          </p>

          {LEAD_FUNNEL_CONFIG.bookingCalendarUrl && (
            <a
              href={LEAD_FUNNEL_CONFIG.bookingCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAnalyticsEvent(ANALYTICS_EVENTS.calendarOpen, {
                cta_location: 'audit_form_success',
                form_location: formLocation,
                calendar_provider: 'configured_calendar',
              })}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-4 font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Book the next conversation
            </a>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContactClick('whatsapp', 'audit_form_success')}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3.5 font-bold text-amazon-dark hover:border-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Continue on WhatsApp
          </a>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-amazon-dark">Get Your Free Amazon Growth Audit</h2>
          <p className="mt-2 text-gray-600">Share your contact details and revenue range. We&apos;ll help identify opportunities to improve your Amazon visibility, conversion and sales.</p>

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

            <div>
              <label htmlFor={PRIMARY_AUDIT_FIRST_FIELD_ID} className="block text-sm font-extrabold text-gray-800">
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
                className={inputClass(errors.name)}
              />
              {errors.name && (
                <p id="primary-audit-name-error" className="mt-1.5 text-sm font-semibold text-red-700">{errors.name}</p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-extrabold text-gray-800">
                Work email or WhatsApp number <span aria-hidden="true">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="radio"
                    name="contactMethod"
                    value={CONTACT_METHODS.email}
                    checked={!contactIsWhatsApp}
                    onChange={handleContactMethodChange}
                    className="h-4 w-4 accent-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  />
                  Work email
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="radio"
                    name="contactMethod"
                    value={CONTACT_METHODS.whatsapp}
                    checked={contactIsWhatsApp}
                    onChange={handleContactMethodChange}
                    className="h-4 w-4 accent-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  />
                  WhatsApp
                </label>
              </div>
              <label htmlFor={fieldIds.contact} className="sr-only">
                {contactIsWhatsApp ? 'WhatsApp number with country code' : 'Work email'}
              </label>
              <input
                type={contactIsWhatsApp ? 'tel' : 'email'}
                inputMode={contactIsWhatsApp ? 'tel' : 'email'}
                id={fieldIds.contact}
                name="contact"
                autoComplete={contactIsWhatsApp ? 'tel' : 'email'}
                autoCapitalize="none"
                spellCheck="false"
                enterKeyHint="next"
                required
                value={formData.contact}
                onChange={handleFieldChange}
                aria-invalid={Boolean(errors.contact)}
                aria-describedby={getDescribedBy(
                  contactIsWhatsApp ? 'primary-audit-contact-hint' : '',
                  errors.contact ? 'primary-audit-contact-error' : '',
                )}
                className={inputClass(errors.contact)}
              />
              {contactIsWhatsApp && (
                <p id="primary-audit-contact-hint" className="mt-1.5 text-sm text-gray-600">
                  Include the country code, for example +91.
                </p>
              )}
              {errors.contact && (
                <p id="primary-audit-contact-error" className="mt-1.5 text-sm font-semibold text-red-700">{errors.contact}</p>
              )}
            </fieldset>

            {collectMonthlyRevenue && (
              <div className="space-y-4">
                <fieldset aria-describedby={errors.revenueCurrency ? 'primary-audit-currency-error' : undefined}>
                  <legend className="text-sm font-extrabold text-gray-800">Revenue currency <span aria-hidden="true">*</span></legend>
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
                        <span className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-3 text-sm font-bold text-gray-700 transition-colors peer-checked:border-primary-700 peer-checked:bg-primary-100 peer-checked:text-primary-900 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-700">
                          <span aria-hidden="true">{currency.symbol}</span>{currency.code}<span className="sr-only"> — {currency.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.revenueCurrency && <p id="primary-audit-currency-error" className="mt-1.5 text-sm font-semibold text-red-700">{errors.revenueCurrency}</p>}
                </fieldset>
                <div>
                  <label htmlFor={fieldIds.monthlyRevenue} className="block text-sm font-extrabold text-gray-800">
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
                    className={inputClass(errors.monthlyRevenue)}
                  >
                    <option value="">Select the closest range</option>
                    {getMonthlyRevenueOptions(formData.revenueCurrency).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <p id="primary-audit-monthly-revenue-hint" className="mt-1.5 text-sm text-gray-600" aria-live="polite">
                    Select your approximate monthly revenue in {formData.revenueCurrency}. Choose a new range when switching currencies.
                  </p>
                  {errors.monthlyRevenue && <p id="primary-audit-monthly-revenue-error" className="mt-1.5 text-sm font-semibold text-red-700">{errors.monthlyRevenue}</p>}
                </div>
              </div>
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
                  {PRIMARY_CTA_LABEL}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>

            <LegalConsent className="pt-1 text-gray-600" />
          </form>

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
        </>
      )}
    </div>
  );
};

export default AuditForm;
