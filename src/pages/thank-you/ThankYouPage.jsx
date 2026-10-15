import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Check, Lock, MessageCircle, Search, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import { AmazonPartnerBadges } from '../../components/ui/AmazonPartnerBadge.jsx';
import AuditDetailsSection from '../../features/lead-capture/AuditDetailsSection.jsx';
import { readThankYouHandoff } from '../../features/lead-capture/thankYouHandoff.js';
import { celebrate } from '../../features/lead-capture/celebrate.js';
import { firstNameOf } from '../../features/lead-capture/leadDisplay.js';
import { LEAD_FUNNEL_CONFIG } from '../../features/lead-capture/config.js';
import { PRIMARY_AUDIT_ROUTE, PRIMARY_CTA_LABEL, getScrollBehavior } from '../../features/lead-capture/primaryCta.js';
import { detailFieldIds } from '../../features/lead-capture/useAuditDetails.js';
import { SITE_CONFIG, getWhatsAppUrl } from '../../config/site.js';
import { ANALYTICS_EVENTS, trackAnalyticsEvent, trackContactClick } from '../../analytics/index.js';
import expertPhoto from '../../assets/amazon_pics/gautam-soni-600.webp';
import '../../features/lead-capture/lead-capture.css';

const getNextSteps = (viaWhatsApp) => [
  { icon: <Search className="h-6 w-6" />, title: 'We review your Amazon account', text: 'PPC, listings, rankings and account health — using the details you shared.' },
  { icon: <Sparkles className="h-6 w-6" />, title: 'We prepare your audit findings', text: 'Clear priorities and quick wins for your store, in plain language.' },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: viaWhatsApp ? 'We reach out on WhatsApp' : 'We get in touch',
    text: 'We walk you through the findings on WhatsApp or by email — no obligation.',
  },
];

const WAIT_LINKS = [
  { icon: <TrendingUp className="h-5 w-5" />, title: 'See real sales snapshots', text: 'Account-level results from Amazon India and US sellers.', href: '/#sales-snapshots', label: 'View results' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Check our Amazon SPN listings', text: 'Listed on Amazon’s Service Provider Network in the USA, UK and India.', href: '/#amazon-credentials', label: 'View listings' },
  { icon: <Target className="h-5 w-5" />, title: 'Explore your growth scenario', text: 'Try the growth calculator with your own numbers.', href: '/#growth-calculator', label: 'Open calculator' },
];

const SHARE_POINTS = [
  'Your store link or a top ASIN',
  'Where you sell — Amazon, Flipkart, Meesho or TikTok Shop',
  'Monthly ad spend and your biggest challenges',
];

const secondaryOnDark = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-amazon-dark transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amazon-dark';

// /thank-you: shown after a confirmed audit request. Without the tab's hand-off it stays generic.
const ThankYouPage = () => {
  const lead = useMemo(() => readThankYouHandoff(), []);
  const headingRef = useRef(null);
  const badgeRef = useRef(null);
  const canShareDetails = Boolean(lead?.leadId);
  const whatsappUrl = getWhatsAppUrl(lead
    ? `Hello ${SITE_CONFIG.brandName}, I just requested a free Amazon audit${lead.leadId ? ` (${lead.leadId})` : ''}. My name is ${lead.name}.`
    : `Hello, I would like to discuss a free Amazon audit with ${SITE_CONFIG.brandName}.`);
  const trackWhatsApp = (location) => () => trackContactClick('whatsapp', location);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    if (lead) celebrate(badgeRef.current);
  }, [lead]);

  const openDetails = (event) => {
    event.preventDefault();
    globalThis.document?.getElementById('audit-details')?.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
    globalThis.document?.getElementById(detailFieldIds.storeUrl)?.focus({ preventScroll: true });
  };

  return (
    <MarketingLayout>
      <section aria-labelledby="thank-you-heading" className="relative overflow-hidden bg-amazon-dark text-white">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-[140px]" />
        <div className="section-shell relative flex flex-col items-center py-16 text-center md:py-24">
          {lead && (
            <div ref={badgeRef} className="relative h-24 w-24 md:h-28 md:w-28" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-primary-200/35" />
              <span className="du-success-pulse absolute inset-0 rounded-full bg-primary-300" />
              <span className="du-success-badge absolute inset-[14%] flex items-center justify-center rounded-full bg-primary-500 text-amazon-dark shadow-[0_8px_28px_rgba(255,212,0,0.35)]">
                <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="du-success-check" pathLength="1" d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
          )}
          <p className="du-fade-up mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-primary-400" style={{ '--du-stagger': 0 }}>
            {lead ? 'Audit request received' : 'Digital Universe'}
          </p>
          <h1
            id="thank-you-heading"
            ref={headingRef}
            tabIndex={-1}
            className="du-fade-up mt-3 max-w-4xl text-4xl font-bold leading-tight tracking-tight outline-none md:text-5xl"
            style={{ '--du-stagger': 1 }}
          >
            {lead ? (
              <>
                Thanks, {firstNameOf(lead.name)}! <span aria-hidden="true">🎉</span>
                <span className="block text-primary-400">Your free Amazon audit is underway.</span>
              </>
            ) : 'Thanks for getting in touch'}
          </h1>
          <p className="du-fade-up mt-5 max-w-3xl text-lg leading-relaxed text-gray-300 md:text-xl" style={{ '--du-stagger': 2 }}>
            {lead ? (
              <>
                We received your audit request. Our team will contact you
                {lead.whatsapp && <> on WhatsApp at <strong className="whitespace-nowrap font-semibold text-white">{lead.whatsapp}</strong></>}
                {lead.whatsapp && lead.email && ' and'}
                {lead.email && <> by email at <strong className="break-all font-semibold text-white">{lead.email}</strong></>}.
              </>
            ) : 'If you’ve just requested a free Amazon audit, our team will contact you soon. Haven’t requested one yet? It takes about 30 seconds.'}
          </p>
          {canShareDetails && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-gray-300">
              Request ID <strong className="font-bold text-white">{lead.leadId}</strong>
            </p>
          )}
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            {lead ? (
              canShareDetails && (
                <a href="#audit-details" onClick={openDetails} className="button-primary w-full sm:w-auto">
                  Help us prepare your audit<ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              )
            ) : (
              <a href={PRIMARY_AUDIT_ROUTE} className="button-primary w-full sm:w-auto">
                {PRIMARY_CTA_LABEL}<ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={trackWhatsApp('thank_you_hero')} className={`${secondaryOnDark} w-full sm:w-auto`}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Chat on WhatsApp now
            </a>
          </div>
          {canShareDetails && (
            <p className="mt-4 text-sm text-slate-400">Step 2 is optional — it takes about a minute and helps us prepare before we talk.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="next-steps-heading" className="section-space bg-primary-50">
        <div className="section-shell">
          <div className="text-center">
            <p className="eyebrow">How it works</p>
            <h2 id="next-steps-heading" className="section-title">What happens next</h2>
            <p className="mt-3 text-lg text-gray-600">No obligation — here’s how your free audit works.</p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {getNextSteps(Boolean(lead?.whatsapp)).map(({ icon, title, text }, index) => (
              <li key={title} className="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm md:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-900" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary-700">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-amazon-dark">{title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {canShareDetails && (
        <section id="audit-details" aria-labelledby="audit-details-heading" className="section-space scroll-mt-24 bg-white">
          <div className="section-shell grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">Optional · About 1 minute</p>
              <h2 id="audit-details-heading" className="section-title">Want a sharper audit?</h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">Share a few store details so we can review your account before we talk. Skip anything you’re unsure about.</p>
              <ul className="mt-6 space-y-3">
                {SHARE_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 font-medium text-gray-800">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-900" aria-hidden="true"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                We never ask for your Seller Central password. If we need access later, we’ll request a limited user permission through Amazon.
              </p>
            </div>
            <AuditDetailsSection
              lead={lead}
              bookingCalendarUrl={LEAD_FUNNEL_CONFIG.bookingCalendarUrl}
              onCalendarClick={() => trackAnalyticsEvent(ANALYTICS_EVENTS.calendarOpen, {
                cta_location: 'thank_you_details',
                form_location: lead.formLocation,
                calendar_provider: 'configured_calendar',
              })}
              whatsappUrl={whatsappUrl}
              onWhatsAppClick={trackWhatsApp('thank_you_details')}
            />
          </div>
        </section>
      )}

      <section aria-labelledby="while-you-wait-heading" className="section-space bg-gray-50">
        <div className="section-shell">
          <p className="eyebrow">While you wait</p>
          <h2 id="while-you-wait-heading" className="section-title">Get to know how we work</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {WAIT_LINKS.map(({ icon, title, text, href, label }) => (
              <li key={title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amazon-dark text-primary-500" aria-hidden="true">{icon}</span>
                <h3 className="mt-4 text-lg font-bold text-amazon-dark">{title}</h3>
                <p className="mt-2 flex-1 leading-relaxed text-gray-600">{text}</p>
                <a href={href} className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start rounded font-bold text-primary-800 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700">
                  {label}<ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">: {title}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl bg-amazon-dark p-6 text-center text-white md:flex-row md:p-7 md:text-left">
            <img src={expertPhoto} alt="Gautam Soni, founder of Digital Universe" width="600" height="900" loading="lazy" decoding="async" className="h-20 w-20 shrink-0 rounded-full border-[3px] border-primary-500 object-cover object-top" />
            <div className="flex-1">
              <p className="text-xl font-bold">Your audit is reviewed by our team, led by Gautam Soni.</p>
              <p className="mt-1 font-medium text-primary-400">Founder · Amazon Marketplace Specialist</p>
            </div>
            <AmazonPartnerBadges className="md:w-[22rem]" />
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ThankYouPage;
