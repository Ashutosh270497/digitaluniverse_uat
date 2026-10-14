import { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { CONTACT_METHODS } from '../../../shared/leadSchema.js';
import { celebrate } from './celebrate.js';
import { firstNameOf } from './leadDisplay.js';

const getNextSteps = (viaWhatsApp) => [
  ['We review your Amazon account', 'PPC, listings, rankings and account health.'],
  ['We prepare your audit findings', 'Clear priorities and quick wins for your store.'],
  [viaWhatsApp ? 'We reach out on WhatsApp' : 'We reply by email', 'To walk you through the findings — no obligation.'],
];

export const WhatsAppLink = ({ href, onClick, primary = false, children = 'Continue on WhatsApp' }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className={primary
      ? 'button-primary w-full'
      : 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3.5 font-bold text-amazon-dark hover:border-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2'}
  >
    <MessageCircle className="h-5 w-5" aria-hidden="true" />
    {children}
  </a>
);

// A2: animated, personalised confirmation shown once the lead is delivered.
const AuditSuccess = ({ lead, onAddDetails, whatsappUrl, onWhatsAppClick }) => {
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const viaWhatsApp = lead.contactMethod === CONTACT_METHODS.whatsapp;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    celebrate(badgeRef.current);
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <div className="flex flex-col items-center text-center">
        <div ref={badgeRef} className="relative mt-1 h-24 w-24" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-primary-200/60" />
          <span className="du-success-pulse absolute inset-0 rounded-full bg-primary-300" />
          <span className="du-success-badge absolute inset-3.5 flex items-center justify-center rounded-full bg-primary-500 text-amazon-dark shadow-lg shadow-primary-700/25">
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="du-success-check" pathLength="1" d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        </div>
        <p className="du-fade-up mt-4 text-xs font-extrabold uppercase tracking-[0.1em] text-primary-700" style={{ '--du-stagger': 0 }}>
          Audit request received
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="du-fade-up mt-2 text-3xl font-bold tracking-tight text-amazon-dark outline-none"
          style={{ '--du-stagger': 1 }}
        >
          Thanks, {firstNameOf(lead.name)}! <span aria-hidden="true">🎉</span>
        </h2>
        <p className="du-fade-up mt-3 leading-relaxed text-gray-700" style={{ '--du-stagger': 2 }}>
          We received your audit request. We’ll contact you {viaWhatsApp ? 'on WhatsApp' : 'by email'} at{' '}
          <strong className="font-semibold text-amazon-dark">{lead.contact}</strong>.
        </p>
      </div>

      <hr className="my-5 border-gray-200" />
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-gray-500">What happens next</p>
      <ol className="mt-3 space-y-3.5">
        {getNextSteps(viaWhatsApp).map(([title, description], index) => (
          <li key={title} className="du-fade-up flex gap-3.5" style={{ '--du-stagger': index + 3 }}>
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-extrabold text-primary-900">
              {index + 1}
            </span>
            <span>
              <span className="block font-bold text-amazon-dark">{title}</span>
              <span className="block text-sm text-gray-600">{description}</span>
            </span>
          </li>
        ))}
      </ol>

      {onAddDetails && (
        <div className="du-fade-up mt-5 rounded-xl border border-primary-200 bg-primary-50 p-4" style={{ '--du-stagger': 6 }}>
          <p className="flex gap-2.5 text-sm font-medium text-primary-900">
            <Sparkles className="h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
            Want a sharper audit? Share a few store details — it takes about a minute and is completely optional.
          </p>
          <button type="button" onClick={onAddDetails} className="button-primary mt-3 w-full">
            Help us prepare your audit
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-3">
        <WhatsAppLink href={whatsappUrl} onClick={onWhatsAppClick} />
      </div>
    </div>
  );
};

export default AuditSuccess;
