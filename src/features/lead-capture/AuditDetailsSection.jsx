import { useEffect, useRef } from 'react';
import { ArrowRight, CalendarDays, Check, LoaderCircle, MessageCircle } from 'lucide-react';
import AuditDetailsFields from './AuditDetailsFields.jsx';
import { useAuditDetails } from './useAuditDetails.js';

const whatsappLinkClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-amazon-dark hover:border-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2';

const useFocusOnMount = () => {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return ref;
};

const DetailsSent = ({ lead, summary, bookingCalendarUrl, onCalendarClick, whatsappUrl, onWhatsAppClick }) => {
  const headingRef = useFocusOnMount();
  const rows = [
    ['Store', summary.storeUrl],
    ['Marketplaces', summary.marketplaces],
    ['Seller type', summary.sellerType],
    ['Ad spend', summary.adSpend && `${summary.adSpend} / month`],
    ['Focus', summary.challenges],
    ['Notes', summary.notes],
  ].filter(([, value]) => value);

  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8">
      <span className="du-success-badge flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-amazon-dark" aria-hidden="true">
        <Check className="h-7 w-7" strokeWidth={3} />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold tracking-tight text-amazon-dark outline-none">Thanks — your details are in.</h3>
      <p className="mt-2 leading-relaxed text-gray-700">
        These details help us prepare a sharper audit. We’ll reach out on WhatsApp at{' '}
        <strong className="whitespace-nowrap font-semibold text-amazon-dark">{lead.whatsapp}</strong>.
      </p>
      {rows.length > 0 && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-gray-500">What you shared</p>
          <dl className="mt-2 space-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt className="w-28 shrink-0 font-medium text-gray-500">{label}</dt>
                <dd className="min-w-0 break-words font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {bookingCalendarUrl && (
          <a href={bookingCalendarUrl} target="_blank" rel="noopener noreferrer" onClick={onCalendarClick} className="button-primary flex-1">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            Book your audit call
          </a>
        )}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={onWhatsAppClick} className={`${bookingCalendarUrl ? whatsappLinkClass : 'button-primary'} flex-1`}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

const DetailsSkipped = ({ whatsappUrl, onWhatsAppClick }) => {
  const headingRef = useFocusOnMount();
  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
      <h3 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-amazon-dark outline-none">No problem — your audit request is with our team.</h3>
      <p className="mt-2 leading-relaxed text-primary-900">You can share store details anytime on WhatsApp.</p>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={onWhatsAppClick} className={`${whatsappLinkClass} mt-5`}>
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Chat on WhatsApp
      </a>
    </div>
  );
};

// The optional Step 2 card on /thank-you: the details form, then a sent or skipped state.
const AuditDetailsSection = ({ lead, bookingCalendarUrl, onCalendarClick, whatsappUrl, onWhatsAppClick }) => {
  const {
    details, errors, status, statusMessage, isSubmitting, sharedDetails,
    handleSubmit, handleDetailsChange, toggleDetailsValue, skipDetails,
  } = useAuditDetails(lead);

  if (status === 'sent') {
    return (
      <DetailsSent
        lead={lead}
        summary={sharedDetails}
        bookingCalendarUrl={bookingCalendarUrl}
        onCalendarClick={onCalendarClick}
        whatsappUrl={whatsappUrl}
        onWhatsAppClick={onWhatsAppClick}
      />
    );
  }
  if (status === 'skipped') return <DetailsSkipped whatsappUrl={whatsappUrl} onWhatsAppClick={onWhatsAppClick} />;

  return (
    <form
      id="audit-details-form"
      method="post"
      onSubmit={handleSubmit}
      aria-labelledby="audit-details-form-heading"
      aria-busy={isSubmitting}
      data-clarity-mask="true"
      noValidate
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8"
    >
      <h3 id="audit-details-form-heading" className="text-xl font-bold text-amazon-dark">Help us prepare your audit</h3>
      {statusMessage && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live={status === 'error' ? 'assertive' : 'polite'}
          className={`rounded-lg border px-4 py-3 text-sm font-semibold ${status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-primary-200 bg-primary-50 text-primary-900'}`}
        >
          {statusMessage}
        </div>
      )}
      <AuditDetailsFields
        details={details}
        errors={errors}
        revenueCurrency={lead.revenueCurrency}
        onChange={handleDetailsChange}
        onToggle={toggleDetailsValue}
      />
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="audit-details-website">Leave this field blank</label>
        <input type="text" id="audit-details-website" name="website" tabIndex={-1} autoComplete="off" value={details.website} onChange={handleDetailsChange} />
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button type="submit" disabled={isSubmitting} className="button-primary w-full flex-1 disabled:cursor-not-allowed disabled:opacity-65">
          {isSubmitting
            ? (<><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />Sending securely…</>)
            : (<>Send details<ArrowRight className="h-5 w-5" aria-hidden="true" /></>)}
        </button>
        <button
          type="button"
          onClick={skipDetails}
          disabled={isSubmitting}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-gray-600 underline underline-offset-4 hover:text-amazon-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
};

export default AuditDetailsSection;
