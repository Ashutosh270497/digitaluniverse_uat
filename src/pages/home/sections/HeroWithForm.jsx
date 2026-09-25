import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import AuditForm from '../../../features/lead-capture/AuditForm.jsx';
import HeroHeadline from './HeroHeadline.jsx';
import { SITE_CONFIG } from '../../../config/site.js';
import { CRO_DEFAULTS, CRO_EXPERIMENT_IDS, getCroValue } from '../../../experiments/index.js';
import { trackSecondaryCtaClick } from '../../../analytics/index.js';
import {
  activatePrimaryAuditForm, focusPrimaryAuditForm, PRIMARY_AUDIT_FORM_GATE_ATTRIBUTE,
  PRIMARY_AUDIT_FORM_REGION_ID, PRIMARY_AUDIT_FORM_REVEAL_EVENT, PRIMARY_CTA_LABEL,
  SECONDARY_CTA_HREF, SECONDARY_CTA_LABEL,
} from '../../../features/lead-capture/primaryCta.js';

const heroHeadline = getCroValue(CRO_EXPERIMENT_IDS.heroPositioning, 'headline', CRO_DEFAULTS.heroHeadline);
const formPresentation = getCroValue(CRO_EXPERIMENT_IDS.formPresentation, 'presentation', 'embedded');

const HeroWithForm = () => {
  const formIsTriggered = formPresentation === 'cta-triggered';
  const [formIsVisible, setFormIsVisible] = useState(!formIsTriggered);
  const revealRequestedRef = useRef(false);

  useEffect(() => {
    if (!formIsTriggered) return undefined;

    const documentElement = globalThis.document?.documentElement;
    const revealForm = () => {
      revealRequestedRef.current = true;
      setFormIsVisible(true);
    };
    documentElement?.setAttribute(PRIMARY_AUDIT_FORM_GATE_ATTRIBUTE, 'true');
    globalThis.document?.addEventListener(PRIMARY_AUDIT_FORM_REVEAL_EVENT, revealForm);

    return () => {
      documentElement?.removeAttribute(PRIMARY_AUDIT_FORM_GATE_ATTRIBUTE);
      globalThis.document?.removeEventListener(PRIMARY_AUDIT_FORM_REVEAL_EVENT, revealForm);
    };
  }, [formIsTriggered]);

  useEffect(() => {
    if (!formIsVisible || !revealRequestedRef.current) return undefined;
    const frame = globalThis.requestAnimationFrame?.(() => focusPrimaryAuditForm());
    revealRequestedRef.current = false;
    return () => {
      if (frame !== undefined) globalThis.cancelAnimationFrame?.(frame);
    };
  }, [formIsVisible]);

  return (
    <section id="home" aria-labelledby="hero-heading" className="relative scroll-mt-20 overflow-hidden bg-brand-hero bg-amazon-dark py-12 text-white lg:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-primary-400/5 blur-3xl" />
      <div className="section-shell relative grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300">Amazon growth. Intelligent business.</p>
          <HeroHeadline headline={heroHeadline} />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
            Boosting profitability, unlocking growth opportunities and building your brand globally.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-gray-200" aria-label="What your account review covers">
            {['PPC performance and advertising efficiency', 'Listing quality and conversion opportunities', 'Account health and marketplace expansion'].map(item => (
              <li key={item} className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />{item}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => activatePrimaryAuditForm({ ctaLocation: 'hero' })} className="button-primary">{PRIMARY_CTA_LABEL}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            <a href={SECONDARY_CTA_HREF} onClick={() => trackSecondaryCtaClick({ ctaLocation: 'hero' })} className="inline-flex min-h-12 items-center gap-2 rounded-lg px-3 text-sm font-bold text-white underline decoration-white/40 underline-offset-4 hover:text-primary-300">{SECONDARY_CTA_LABEL}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <div className="mt-8 border-t border-white/15 pt-6">
            <a href={SITE_CONFIG.amazonAdsPartnerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-primary-300 hover:text-primary-200">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />Amazon Ads Verified Partner<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="mt-1 text-sm text-gray-300">Amazon expertise across Europe, North America and Asia.</p>
            <a href="#ai-services" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-primary-300 underline underline-offset-4">Explore AI solutions for your business<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
        <div id={PRIMARY_AUDIT_FORM_REGION_ID}>
          {formIsVisible ? <AuditForm formLocation="hero" /> : (
            <div className="rounded-2xl bg-white p-7 text-amazon-dark shadow-xl">
              <p className="eyebrow">Start with your account</p>
              <h2 className="mt-3 text-2xl font-bold">Find your next growth opportunities.</h2>
              <p className="mt-4 leading-relaxed text-gray-600">Share your store and priorities to request a focused Amazon audit.</p>
              <button type="button" aria-expanded="false" aria-controls={PRIMARY_AUDIT_FORM_REGION_ID} onClick={() => activatePrimaryAuditForm({ ctaLocation: 'hero_form_gate' })} className="button-primary mt-6 w-full">{PRIMARY_CTA_LABEL}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default HeroWithForm;
