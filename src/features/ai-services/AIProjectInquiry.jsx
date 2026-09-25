import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Cpu, Mail, MessageCircle } from 'lucide-react';
import { AI_SERVICES } from '../../content/aiServices.ts';
import { AI_CONTACT_ID, getAiEmailHref, getAiWhatsAppUrl } from './inquiry.js';
import { trackContactClick } from '../../analytics/index.js';

const AIProjectInquiry = ({ requestedService }) => {
  const sectionRef = useRef(null);
  const selectRef = useRef(null);
  const [serviceId, setServiceId] = useState(() => {
    return AI_SERVICES.some(service => service.id === requestedService) ? requestedService : '';
  });
  const selectedService = AI_SERVICES.find(service => service.id === serviceId);

  useEffect(() => {
    if (window.location.hash !== `#${AI_CONTACT_ID}`) return undefined;
    const frame = window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      selectRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section ref={sectionRef} id={AI_CONTACT_ID} aria-labelledby="ai-project-heading" className="section-space border-t border-primary-200 bg-primary-50">
      <div className="section-shell grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow flex items-center gap-2"><Cpu className="h-4 w-4" aria-hidden="true" />Let’s build something useful</p>
          <h2 id="ai-project-heading" className="section-title">Tell us about your AI project.</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">Whether you have an idea, a repetitive workflow or an existing product to improve, start with a conversation about your business.</p>
          <a href="/#ai-services" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-primary-800 underline underline-offset-4">Explore all AI services<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
        <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm md:p-8">
          <label htmlFor="ai-project-service" className="block text-sm font-bold text-amazon-dark">What would you like to explore?</label>
          <select ref={selectRef} id="ai-project-service" value={serviceId} onChange={event => setServiceId(event.target.value)} className="mt-3 min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-amazon-dark">
            <option value="">Help me choose the right AI service</option>
            {AI_SERVICES.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}
          </select>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">Send a short outline of your project through WhatsApp or email. Your selected service will be included in the message.</p>
          <div className="mt-6 flex flex-col gap-3">
            <a data-ai-whatsapp href={getAiWhatsAppUrl(selectedService?.title)} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp', 'ai_project_enquiry')} className="button-primary"><MessageCircle className="h-4 w-4" aria-hidden="true" />Discuss on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
            <a data-ai-email href={getAiEmailHref(selectedService?.title)} onClick={() => trackContactClick('email', 'ai_project_enquiry')} className="button-secondary"><Mail className="h-4 w-4" aria-hidden="true" />Email your project outline</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIProjectInquiry;
