import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import { PRIMARY_AUDIT_ROUTE, PRIMARY_CTA_LABEL } from '../../../features/lead-capture/primaryCta.js';
import { getWhatsAppUrl } from '../../../config/site.js';
import { getAiContactHref } from '../../../features/ai-services/inquiry.js';
import { trackPrimaryCtaClick, trackContactClick, trackSecondaryCtaClick } from '../../../analytics/index.js';

const FinalConversionSection = () => (
  <section id="book-audit" aria-labelledby="final-conversion-heading" className="home-final-cta section-space">
    <div className="section-shell">
      <div className="final-cta-panel">
        <div className="final-cta-copy">
          <p className="eyebrow">Your next chapter starts here</p>
          <h2 id="final-conversion-heading">Big ambitions.<br />A clear next step.</h2>
          <p>Grow your Amazon business or put AI to work. Bring us your priorities. Let’s build a practical plan together.</p>
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp', 'final_conversion')} className="final-whatsapp"><MessageCircle className="h-4 w-4" aria-hidden="true" />Prefer a conversation? Talk on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
        <div className="final-cta-actions">
          <a href={PRIMARY_AUDIT_ROUTE} onClick={() => trackPrimaryCtaClick({ ctaLocation: 'final_conversion', ctaLabel: PRIMARY_CTA_LABEL })} className="final-action-card"><span className="final-action-icon" aria-hidden="true"><ArrowUpRight /></span><span><span className="final-action-kicker">For your Amazon business</span><strong>{PRIMARY_CTA_LABEL}</strong><span className="final-action-detail">Share your store and find your next priorities.</span></span><ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
          <a href={getAiContactHref()} onClick={() => trackSecondaryCtaClick({ ctaLocation: 'final_conversion_ai', ctaLabel: 'Discuss your AI project' })} className="final-action-card final-action-ai"><span className="final-action-icon" aria-hidden="true"><ArrowUpRight /></span><span><span className="final-action-kicker">For a smarter way of working</span><strong>Discuss your AI project</strong><span className="final-action-detail">Explore what you could build or automate.</span></span><ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
        </div>
      </div>
    </div>
  </section>
);
export default FinalConversionSection;
