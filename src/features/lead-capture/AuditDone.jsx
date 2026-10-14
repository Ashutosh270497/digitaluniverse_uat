import { useEffect, useRef } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import { CONTACT_METHODS } from '../../../shared/leadSchema.js';
import { WhatsAppLink } from './AuditSuccess.jsx';
import { firstNameOf } from './leadDisplay.js';

// A4: closes the flow after Step 2 is sent or skipped and plays back what was shared.
const AuditDone = ({ lead, summary, bookingCalendarUrl, onCalendarClick, whatsappUrl, onWhatsAppClick }) => {
  const headingRef = useRef(null);
  const viaWhatsApp = lead.contactMethod === CONTACT_METHODS.whatsapp;
  const rows = summary
    ? [
      ['Store', summary.storeUrl],
      ['Marketplaces', summary.marketplaces],
      ['Seller type', summary.sellerType],
      ['Ad spend', summary.adSpend && `${summary.adSpend} / month`],
      ['Focus', summary.challenges],
      ['Notes', summary.notes],
    ].filter(([, value]) => value)
    : [];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <span className="du-success-badge flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-amazon-dark" aria-hidden="true">
        <Check className="h-7 w-7" strokeWidth={3} />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold tracking-tight text-amazon-dark outline-none">
        You’re all set, {firstNameOf(lead.name)}.
      </h2>
      <p className="mt-2 leading-relaxed text-gray-700">
        {summary ? 'Thanks — these details help us prepare a sharper audit.' : 'Thanks — your audit request is with our team.'}{' '}
        We’ll reach out {viaWhatsApp ? 'on WhatsApp' : 'by email'} at <strong className="font-semibold text-amazon-dark">{lead.contact}</strong>.
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

      {bookingCalendarUrl && (
        <a
          href={bookingCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCalendarClick}
          className="button-primary mt-6 w-full"
        >
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
          Book your audit call
        </a>
      )}
      <div className={bookingCalendarUrl ? 'mt-3' : 'mt-6'}>
        <WhatsAppLink href={whatsappUrl} onClick={onWhatsAppClick} primary={!bookingCalendarUrl} />
      </div>
    </div>
  );
};

export default AuditDone;
