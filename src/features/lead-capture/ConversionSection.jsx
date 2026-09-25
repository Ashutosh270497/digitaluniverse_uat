import { ArrowRight } from 'lucide-react';
import { trackPrimaryCtaClick } from '../../analytics/index.js';
import { PRIMARY_AUDIT_ROUTE, PRIMARY_CTA_LABEL } from './primaryCta.js';

const ConversionSection = () => (
  <section className="bg-amazon-dark py-14 text-white" aria-labelledby="internal-page-cta-heading">
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
      <div>
        <h2 id="internal-page-cta-heading" className="text-2xl font-black">
          Start with an Amazon account diagnosis
        </h2>
        <p className="mt-2 max-w-2xl text-gray-300">
          Share your store or ASIN so the proposed scope can reflect the account you actually operate.
        </p>
      </div>
      <a
        href={PRIMARY_AUDIT_ROUTE}
        onClick={() => trackPrimaryCtaClick({
          ctaLocation: 'internal_page_conversion',
          ctaLabel: PRIMARY_CTA_LABEL,
        })}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3.5 font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        {PRIMARY_CTA_LABEL}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  </section>
);

export default ConversionSection;
