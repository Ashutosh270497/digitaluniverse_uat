import { ArrowRight, ExternalLink, FileText, LayoutTemplate, ShieldCheck, Target } from 'lucide-react';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import AmazonPartnerBadge from '../../components/ui/AmazonPartnerBadge.jsx';
import { SITE_CONFIG, SPN_INDIA_SERVICES } from '../../config/site.js';
import { PRIMARY_AUDIT_ROUTE, PRIMARY_CTA_LABEL } from '../../features/lead-capture/primaryCta.js';

const details = {
  accountManagement: { icon: ShieldCheck, description: 'Account health, day-to-day operations and a coordinated growth strategy.' },
  advertising: { icon: Target, description: 'Amazon advertising, campaign management and performance optimisation.' },
  cataloging: { icon: FileText, description: 'Product listings, catalog accuracy and marketplace-ready product information.' },
  enhancedBrandContent: { icon: LayoutTemplate, description: 'A+ Content and brand storytelling that help shoppers understand your products.' },
};

const SpnPage = () => (
  <MarketingLayout>
    <section className="bg-amazon-dark py-14 text-white md:py-20">
      <div className="section-shell">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Amazon SPN' }]} className="text-gray-300" />
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-primary-300">Amazon Service Provider Network</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Explore our Amazon SPN services.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">Choose the support your business needs. Each service below opens Digital Universe Pro’s Amazon SPN India listing.</p>
        <AmazonPartnerBadge kind="spn" compact href={SITE_CONFIG.spnLinks.accountManagement} label="India · Account Management" className="mt-7" />
      </div>
    </section>
    <section className="section-space bg-amazon-cream" aria-label="Amazon SPN India service listings">
      <div className="section-shell">
        <div className="grid gap-5 md:grid-cols-2">
          {SPN_INDIA_SERVICES.map(service => {
            const { icon: Icon, description } = details[service.key];
            return (
              <a key={service.key} href={service.url} target="_blank" rel="noopener noreferrer" data-spn-service={service.key} className="group flex flex-col rounded-2xl border border-primary-200 bg-white p-6 transition-colors hover:border-primary-600 sm:p-8">
                <Icon className="h-10 w-10 rounded-lg bg-primary-100 p-2 text-primary-800" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-amazon-dark">{service.label}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-gray-600">{description}</p>
                <span className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm font-bold text-primary-800">View on Amazon SPN<ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></span>
              </a>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-primary-500 p-6">
          <div><h2 className="text-xl font-bold">Need help choosing a service?</h2><p className="mt-2 text-sm">Start with a free Amazon growth audit.</p></div>
          <a href={PRIMARY_AUDIT_ROUTE} className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-amazon-dark px-5 py-3 text-sm font-bold text-white">{PRIMARY_CTA_LABEL}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
        <a href="/#amazon-credentials" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-primary-800 underline underline-offset-4">View USA, UK and India partner listings<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </div>
    </section>
  </MarketingLayout>
);

export default SpnPage;
