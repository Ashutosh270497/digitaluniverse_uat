import { useEffect } from 'react';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import { ArrowRight, Bot, BrainCircuit, Check, CloudCog, Code2, Cpu, Network, ScanSearch } from 'lucide-react';
import { AI_SERVICES } from '../../content/aiServices.ts';
import AICapabilitiesVisual from '../../features/ai-services/AICapabilitiesVisual.jsx';
import { getAiContactHref } from '../../features/ai-services/inquiry.js';
import { trackSecondaryCtaClick } from '../../analytics/index.js';
import '../../features/ai-services/ai-services.css';

const icons = { agents: Bot, saas: Code2, knowledge: ScanSearch, workflow: Network, strategy: BrainCircuit, infrastructure: CloudCog };

const AIServicesPage = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <MarketingLayout>
      <section id="ai-services" aria-labelledby="ai-services-heading" className="ai-services-section section-space text-white">
        <div className="section-shell">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'AI Services' }]} className="mb-10 text-gray-300" />
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-amazon-dark"><Cpu className="h-4 w-4 shrink-0" aria-hidden="true" />AI solutions for your business</p>
              <h1 id="ai-services-heading" className="mt-6 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">AI solutions that drive real <span className="text-primary-400">business growth.</span></h1>
              <div className="mt-6 h-1 w-16 rounded-full bg-primary-500" aria-hidden="true" />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">Put artificial intelligence to work where it matters. We build tailored solutions to automate operations, support better decisions and create more room for your business to grow.</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a href={getAiContactHref()} onClick={() => trackSecondaryCtaClick({ ctaLocation: 'ai_services_intro', ctaLabel: 'Discuss an AI project' })} className="button-primary">Discuss an AI project<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="#ai-service-grid" className="inline-flex min-h-12 items-center gap-2 rounded text-sm font-semibold text-primary-200 underline underline-offset-4 hover:text-white">Explore our capabilities<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>
            </div>
            <AICapabilitiesVisual />
          </div>

          <div id="ai-service-grid" className="mt-12 scroll-mt-28 border-t border-primary-400/20 pt-10 md:mt-16">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h2 className="text-2xl font-bold tracking-tight">Six ways to put AI to work.</h2>
              <p className="max-w-sm text-sm leading-relaxed text-gray-300">From a single workflow to a complete AI product, start with the support your business needs.</p>
            </div>
            <div className="ai-service-grid">
              {AI_SERVICES.map((service, index) => {
                const Icon = icons[service.icon];
                return (
                  <article key={service.id} id={`ai-${service.id}`} data-ai-service={service.id} aria-labelledby={`ai-title-${service.id}`} className="ai-service-card scroll-mt-28">
                    <div className="flex items-center justify-between gap-4">
                      <span className="ai-service-icon"><Icon className="h-7 w-7" aria-hidden="true" /></span>
                      <span className="text-sm font-bold tabular-nums tracking-[0.15em] text-primary-300" aria-hidden="true">0{index + 1}</span>
                    </div>
                    <h3 id={`ai-title-${service.id}`} className="ai-service-title">{service.title}</h3>
                    <p className="ai-service-description">{service.description}</p>
                    <div className="ai-service-capabilities">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-300">{service.listHeading}</p>
                      <ul className="mt-4 space-y-3">
                        {service.capabilities.map(item => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" aria-hidden="true" />{item}</li>)}
                      </ul>
                    </div>
                    <a href={getAiContactHref(service.id)} onClick={() => trackSecondaryCtaClick({ ctaLocation: 'ai_service_card', ctaLabel: 'Let’s discuss your project', service: service.id })} className="ai-service-link">Let’s discuss your project<ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> — {service.title}</span></a>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary-500 p-6 text-amazon-dark sm:flex-row sm:items-center md:p-8">
            <div><h2 className="text-xl font-bold">Have a challenge in mind?</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed">Tell us what you want to improve. We’ll help you explore a practical starting point for AI.</p></div>
            <a href={getAiContactHref()} onClick={() => trackSecondaryCtaClick({ ctaLocation: 'ai_services_outro', ctaLabel: 'Plan your AI project' })} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-amazon-dark px-5 py-3 text-sm font-bold text-white hover:bg-black">Plan your AI project<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default AIServicesPage;
