import { ArrowRight, Check, Clock, LoaderCircle, MessageCircle } from 'lucide-react';
import { REVENUE_CURRENCIES, getMonthlyRevenueOptions } from '../../../shared/leadSchema.js';
import { PRIMARY_AUDIT_FIRST_FIELD_ID, PRIMARY_AUDIT_FORM_ID, PRIMARY_CTA_LABEL } from './primaryCta.js';
import { trackContactClick } from '../../analytics/index.js';
import LegalConsent from './LegalConsent.jsx';
import { DIAL_CODES } from './dialCodes.js';
import { errorClassName, hintClassName, inputClassName, labelClassName, optionClassName } from './formStyles.js';
import { useAuditForm } from './useAuditForm.js';

const getDescribedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

const TRUST_POINTS = ['Free, no obligation', 'No Seller Central password needed'];

// Step 1 of the audit funnel. A confirmed submission continues on /thank-you.
const AuditForm = ({ formLocation = 'unspecified' }) => {
  const {
    formData, errors, status, statusMessage, isSubmitting, deliveryFailed,
    whatsappUrl, fieldIds, collectMonthlyRevenue, handleSubmit, markFormStarted, handleFieldChange,
  } = useAuditForm(formLocation);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl md:p-7">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary-900">Step 1 of 2</span>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Takes about 30 seconds
        </span>
      </div>
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
          {errors.name && <p id="primary-audit-name-error" className={errorClassName}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={fieldIds.email} className={labelClassName}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            inputMode="email"
            id={fieldIds.email}
            name="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck="false"
            enterKeyHint="next"
            required
            placeholder="you@yourbrand.com"
            value={formData.email}
            onChange={handleFieldChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'primary-audit-email-error' : undefined}
            className={inputClassName(errors.email)}
          />
          {errors.email && <p id="primary-audit-email-error" className={errorClassName}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor={fieldIds.whatsapp} className={labelClassName}>
            WhatsApp number <span aria-hidden="true">*</span>
          </label>
          <div className="mt-2 flex gap-2">
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
            <input
              type="tel"
              inputMode="tel"
              id={fieldIds.whatsapp}
              name="whatsapp"
              autoComplete={formData.dialCode ? 'tel-national' : 'tel'}
              enterKeyHint="next"
              required
              placeholder={formData.dialCode ? '97924 20796' : '+971 50 123 4567'}
              value={formData.whatsapp}
              onChange={handleFieldChange}
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby={getDescribedBy('primary-audit-whatsapp-hint', errors.whatsapp ? 'primary-audit-whatsapp-error' : '')}
              className={inputClassName(errors.whatsapp, { inline: true })}
            />
          </div>
          <p id="primary-audit-whatsapp-hint" className={hintClassName}>
            {formData.dialCode
              ? 'We’ll send audit updates on WhatsApp — no spam, ever.'
              : 'Include your country code, for example +971.'}
          </p>
          {errors.whatsapp && <p id="primary-audit-whatsapp-error" className={errorClassName}>{errors.whatsapp}</p>}
        </div>

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
          disabled={isSubmitting || status === 'success'}
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

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-gray-700">
          {TRUST_POINTS.map(point => (
            <li key={point} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
        <LegalConsent className="pt-1 text-gray-600" />
      </form>

      {deliveryFailed && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContactClick('whatsapp', `${formLocation}_form_failure`)}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Contact us on WhatsApp instead
        </a>
      )}
    </div>
  );
};

export default AuditForm;
