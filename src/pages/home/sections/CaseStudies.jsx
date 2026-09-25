import { ArrowRight, FileCheck2 } from 'lucide-react';
import { HOME_SECTION_IDS } from '../../../config/navigation.js';
import { CASE_STUDIES_ROUTE } from '../../../config/routes.js';
import { getFeaturedCaseStudies } from '../../../content/caseStudies.ts';
import { activatePrimaryAuditForm, PRIMARY_CTA_LABEL } from '../../../features/lead-capture/primaryCta.js';
import CaseStudyCard from '../../../components/case-studies/CaseStudyCard.jsx';

const featuredCaseStudies = getFeaturedCaseStudies(3);

const CaseStudies = () => (
  <section
    id={HOME_SECTION_IDS.caseStudies}
    aria-labelledby="case-studies-heading"
    className="scroll-mt-20 bg-white py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-700">
          {featuredCaseStudies.length > 0 ? 'Proven client outcomes' : 'Client outcome evidence'}
        </p>
        <h2 id="case-studies-heading" className="mt-3 text-3xl font-black text-amazon-dark md:text-4xl">
          {featuredCaseStudies.length > 0
            ? 'Real Marketplace Growth, Backed by Client Data'
            : 'Client Outcomes, Published Only with Complete Evidence'}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-gray-700">
          {featuredCaseStudies.length > 0
            ? 'Selected results from accounts supported by Digital Universe Pro. Outcomes vary by product, category, competition, pricing and account conditions.'
            : 'Digital Universe Pro publishes results only when the source, time period, client permission and agency contribution are documented.'}{' '}
          A raw revenue screenshot is supporting context, not standalone proof of agency impact.
        </p>
      </div>

      {featuredCaseStudies.length > 0 ? (
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {featuredCaseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex max-w-4xl items-start gap-4 rounded-2xl border border-primary-200 bg-amazon-cream p-6 sm:p-7">
          <FileCheck2 className="mt-0.5 h-6 w-6 shrink-0 text-primary-700" aria-hidden="true" />
          <div>
            <h3 className="font-extrabold text-amazon-dark">Client-result evidence required before publication</h3>
            <p className="mt-2 leading-relaxed text-gray-700">
              The repository contains no real Seller Central result screenshot and none of the three legacy
              result sets includes client publication permission, source-dated before data, metric definitions,
              or a documented basis for agency attribution. Those claims and the old dashboard recreations
              remain withheld rather than being presented as proof.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-amazon-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h3 className="text-xl font-black">Want the same diagnostic rigor applied to your account?</h3>
          <p className="mt-2 text-gray-300">Start with a focused Amazon audit, not an unsupported performance promise.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <button
            type="button"
            onClick={() => activatePrimaryAuditForm({ ctaLocation: 'case_studies' })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3.5 font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-amazon-dark"
          >
            {PRIMARY_CTA_LABEL}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <a
            href={CASE_STUDIES_ROUTE}
            className="rounded text-sm font-bold text-primary-300 underline decoration-primary-500 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            View All Case Studies
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default CaseStudies;
