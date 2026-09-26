import { ArrowRight, Quote } from 'lucide-react';
import { AmazonPartnerBadges } from '../../../components/ui/AmazonPartnerBadge.jsx';
import { getVerifiedMetrics, METRIC_SCOPE_LABELS } from '../../../content/businessMetrics.ts';
import {
  getFeaturedClientBrands,
  getTestimonialById,
} from '../../../content/socialProof.ts';
import { activatePrimaryAuditForm, PRIMARY_CTA_LABEL } from '../../../features/lead-capture/primaryCta.js';

const verifiedOutcomeMetrics = getVerifiedMetrics('agency-summary').slice(0, 3);
const featuredBrands = getFeaturedClientBrands(4);
const reassuranceTestimonial = getTestimonialById('suveba-sayed-2025-04-14');

const CompactConversionProof = () => (
  <section
    id="conversion-proof"
    aria-labelledby="compact-conversion-proof-heading"
    className="scroll-mt-20 border-y border-gray-200 bg-amazon-cream py-14 md:py-16"
  >
    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-700">
          Account-level reassurance
        </p>
        <h2
          id="compact-conversion-proof-heading"
          className="mt-3 text-3xl font-black text-amazon-dark md:text-4xl"
        >
          Ready to Find the Growth Gaps in Your Amazon Account?
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-700">
          Request a focused account audit covering advertising efficiency, listing conversion,
          account health and marketplace-growth opportunities.
        </p>

        {verifiedOutcomeMetrics.length > 0 && (
          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            {verifiedOutcomeMetrics.map((metric) => (
              <div key={metric.id} className="rounded-xl border border-primary-200 bg-white p-4">
                <dd className="text-2xl font-black text-primary-700">{metric.value}</dd>
                <dt className="mt-1 font-extrabold text-amazon-dark">{metric.label}</dt>
                <dd className="mt-2 text-xs leading-relaxed text-gray-600">
                  {METRIC_SCOPE_LABELS[metric.scope]} · {metric.timePeriod}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => activatePrimaryAuditForm({ ctaLocation: 'compact_proof' })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amazon-dark px-6 py-4 font-extrabold text-white hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
          >
            {PRIMARY_CTA_LABEL}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <AmazonPartnerBadges className="mt-6" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
        {reassuranceTestimonial && (
          <figure>
            <Quote className="h-7 w-7 text-primary-700" aria-hidden="true" />
            <blockquote className="mt-4 leading-relaxed text-gray-700">
              “{reassuranceTestimonial.quote}”
            </blockquote>
            <figcaption className="mt-4 font-extrabold text-amazon-dark">
              {reassuranceTestimonial.clientName}
            </figcaption>
          </figure>
        )}

        <ul className="mt-6 grid grid-cols-4 gap-2 border-t border-gray-200 pt-5" aria-label="Featured client brands">
          {featuredBrands.map((brand) => (
            <li
              key={brand.id}
              data-featured-client-brand-id={brand.id}
              className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-amazon-cream p-2"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} client brand logo`}
                width={brand.logoWidth}
                height={brand.logoHeight}
                loading="lazy"
                decoding="async"
                style={{ transform: `scale(${Math.min(brand.displayScale ?? 1, 1.35)})` }}
                className="h-full w-full object-contain"
              />
            </li>
          ))}
        </ul>

        {verifiedOutcomeMetrics.length === 0 && (
          <p className="mt-5 text-xs leading-relaxed text-gray-500">
            Agency outcome metrics are not shown because the repository does not yet include the
            source, scope and time-period evidence required for publication.
          </p>
        )}
      </div>
    </div>
  </section>
);

export default CompactConversionProof;
