import { useState } from 'react';
import { ArrowUpRight, MessageCircle, Plus } from 'lucide-react';
import { HOME_SECTION_IDS } from '../../../config/navigation.js';
import { FAQ_ITEMS } from '../../../content/serviceContent.ts';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '../../../analytics/index.js';

const FAQ = () => {
  const [openItemId, setOpenItemId] = useState(null);
  const toggleFaq = (faqId, isExpanded) => {
    setOpenItemId(isExpanded ? null : faqId);
    if (!isExpanded) trackAnalyticsEvent(ANALYTICS_EVENTS.faqOpen, { faq_id: faqId }, { dedupeKey: `faq_open:${faqId}`, dedupeWindowMs: 1_000 });
  };

  return (
    <section id={HOME_SECTION_IDS.faq} aria-labelledby="faq-heading" className="home-faq section-space">
      <div className="section-shell home-faq-grid">
        <div className="home-faq-intro">
          <p className="eyebrow">A few useful answers</p>
          <h2 id="faq-heading" className="section-title">Questions before<br className="hidden lg:block" /> you get started?</h2>
          <p className="mt-5 text-base leading-relaxed text-gray-600">Practical answers about Amazon services, account access and your next steps.</p>
          <div className="faq-contact-card">
            <MessageCircle className="h-6 w-6 text-primary-800" aria-hidden="true" />
            <h3>Let’s talk about your business.</h3>
            <p>Have a question specific to your account or project? Tell us what you have in mind.</p>
            <a href="/contact">Start a conversation<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
        <div className="home-faq-list">
          {FAQ_ITEMS.map((faq, index) => {
            const isExpanded = openItemId === faq.id;
            const buttonId = `faq-button-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;
            return (
              <div key={faq.id} className="home-faq-item" data-open={isExpanded}>
                <h3><button id={buttonId} type="button" aria-expanded={isExpanded} aria-controls={panelId} onClick={() => toggleFaq(faq.id, isExpanded)}>
                  <span className="faq-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span>{faq.question}</span>
                  <span className="faq-toggle" aria-hidden="true"><Plus className="h-4 w-4" /></span>
                </button></h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isExpanded} className="faq-answer"><p>{faq.answer}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FAQ;
