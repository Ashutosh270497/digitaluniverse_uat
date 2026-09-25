import { ArrowRight, Check, Globe2, LayoutTemplate, Rocket, Search, ShieldCheck, Target } from 'lucide-react';
import { SERVICES } from '../../../content/serviceContent.ts';
import { SERVICE_PAGE_PATHS, PRIMARY_SERVICE_INQUIRY } from '../../../config/routes.js';
import { activatePrimaryAuditForm, PRIMARY_CTA_LABEL } from '../../../features/lead-capture/primaryCta.js';
const presentation = {
  'amazon-ppc-profitability': { icon: Target, title: 'Amazon PPC management', points: ['Campaign strategy and account audits', 'Keyword and bid optimization', 'Advertising performance reviews'] },
  'account-management-health': { icon: ShieldCheck, title: 'Account management', points: ['Account health and issue resolution', 'Seller Support coordination', 'Day-to-day account priorities'] },
  'listing-seo-catalog': { icon: Search, title: 'Listings that work harder', points: ['Search-focused listing copy', 'Keyword and catalog improvements', 'Variation and listing issue support'] },
  'brand-content-storefront': { icon: LayoutTemplate, title: 'A+ content and storefronts', points: ['A+ content and Brand Story', 'Brand-aligned copy and creative', 'Amazon Storefront planning'] },
  'product-launch-growth': { icon: Rocket, title: 'Product launch strategy', points: ['Launch-readiness review', 'Content and advertising priorities', 'A clear plan for your next ASIN'] },
  'india-global-expansion': { icon: Globe2, title: 'Global marketplace growth', points: ['Marketplace-readiness assessment', 'Localized listings and campaigns', 'A phased expansion plan'] },
};
const Services = () => (
  <section id="services" aria-labelledby="services-heading" className="section-space bg-primary-50">
    <div className="section-shell">
      <div className="home-section-intro"><div><p className="eyebrow">01 / Amazon growth services</p><h2 id="services-heading" className="section-title">The right expertise.<br />One coordinated growth plan.</h2></div><p className="home-section-description">From your next campaign to your next marketplace, choose the support your Amazon business needs.</p></div>
      <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => { const card = presentation[service.id]; const Icon = card.icon; return (
          <article key={service.id} className="amazon-service-card flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-primary-300 lg:p-7">
            <div className="flex items-center justify-between"><span className="service-icon flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-800"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="service-number text-sm font-semibold text-gray-500" aria-hidden="true">0{index + 1}</span></div>
            <h3 className="mt-5 text-xl font-bold tracking-tight text-amazon-dark">{card.title}</h3>
            <ul className="mb-6 mt-5 space-y-3 text-sm leading-relaxed text-gray-600">{card.points.map(point => <li key={point} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-800" aria-hidden="true" />{point}</li>)}</ul>
            <a href={SERVICE_PAGE_PATHS[service.id] ?? PRIMARY_SERVICE_INQUIRY} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded text-sm font-bold text-primary-800 hover:text-primary-900">{SERVICE_PAGE_PATHS[service.id] ? 'Explore service' : 'Discuss your launch'}<ArrowRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> — {card.title}</span></a>
          </article>
        ); })}
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl bg-amazon-cream p-6 sm:flex-row sm:items-center"><p className="font-semibold text-amazon-dark">Not sure where to start? Let’s look at your account.</p><button type="button" onClick={() => activatePrimaryAuditForm({ ctaLocation: 'services' })} className="button-primary shrink-0">{PRIMARY_CTA_LABEL}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>
    </div>
  </section>
);
export default Services;
