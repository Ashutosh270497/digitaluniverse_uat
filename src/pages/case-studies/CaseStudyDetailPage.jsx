import { useEffect } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import AmazonPartnerBadge from '../../components/ui/AmazonPartnerBadge.jsx';
import { SITE_CONFIG } from '../../config/site.js';
import {
  CASE_STUDY_METRIC_KEYS,
  CASE_STUDY_METRIC_LABELS,
} from '../../content/caseStudies.ts';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import CaseStudyCard from '../../components/case-studies/CaseStudyCard.jsx';
import CaseStudyPageHeader from '../../components/layout/CaseStudyPageHeader.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SkipLink from '../../components/ui/SkipLink.jsx';
import {
  ANALYTICS_EVENTS,
  trackAnalyticsEvent,
  trackPrimaryCtaClick,
} from '../../analytics/index.js';
import { PRIMARY_AUDIT_ROUTE, PRIMARY_CTA_LABEL } from '../../features/lead-capture/primaryCta.js';

const MissingValue = ({ children = 'Not provided — required before publication.' }) => (
  <span className="text-gray-600">{children}</span>
);

const TemplateMetricTable = () => (
  <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
    <table className="w-full table-fixed text-left text-sm">
      <caption className="sr-only">Required before and after case-study metrics</caption>
      <thead className="bg-amazon-dark text-white">
        <tr>
          <th scope="col" className="w-[30%] px-3 py-3 sm:px-4">Metric</th>
          <th scope="col" className="w-[35%] px-3 py-3 sm:px-4">Starting metric</th>
          <th scope="col" className="w-[35%] px-3 py-3 sm:px-4">Ending metric</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {CASE_STUDY_METRIC_KEYS.map((key) => (
          <tr key={key} className="align-top">
            <th scope="row" className="px-3 py-4 font-extrabold text-amazon-dark sm:px-4">
              {CASE_STUDY_METRIC_LABELS[key]}
            </th>
            <td className="px-3 py-4 sm:px-4"><MissingValue /></td>
            <td className="px-3 py-4 sm:px-4"><MissingValue /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CaseStudyTemplate = () => (
  <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-900">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      Unpublished, noindex template
    </div>

    <div className="mt-8 grid gap-7 md:grid-cols-2">
      {[
        ['Client or anonymised label', 'Not provided. Add a permitted client name or an approved anonymised label.'],
        ['Product category', 'Not provided.'],
        ['Marketplace', 'Not provided.'],
        ['Time period', 'Not provided. Use exact, matching before-and-after date ranges.'],
        ['Initial problem', 'Not provided. Describe the starting commercial constraint without overstating causation.'],
        ['Work performed', 'Not provided. Record the specific account, PPC, listing, or expansion work delivered.'],
      ].map(([label, value]) => (
        <section key={label} aria-label={label}>
          <h2 className="font-extrabold text-amazon-dark">{label}</h2>
          <p className="mt-2 leading-relaxed text-gray-600">{value}</p>
        </section>
      ))}
    </div>

    <section className="mt-9" aria-labelledby="template-metrics-heading">
      <h2 id="template-metrics-heading" className="text-2xl font-black text-amazon-dark">
        Performance comparison
      </h2>
      <p className="mt-2 text-gray-700">
        Every value needs its definition, source reference, and time period. Missing metrics stay visibly marked as missing.
      </p>
      <TemplateMetricTable />
    </section>

    <div className="mt-9 grid gap-6 lg:grid-cols-3">
      {[
        ['Verification and disclosure', 'Add the Seller Central evidence reference, reviewer, review date, agency-impact methodology, and client publication permission.'],
        ['Testimonial', 'Add only an approved quotation with attribution, source, permission reference, and an explanation of how it was checked.'],
        ['Client-approved logo or image', 'Add only with written permission. Seller Central screenshots must be real, redacted, and described as source evidence rather than agency-impact proof.'],
      ].map(([label, value]) => (
        <section key={label} className="rounded-xl border border-primary-200 bg-amazon-cream p-5" aria-label={label}>
          <h2 className="font-extrabold text-amazon-dark">{label}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{value}</p>
        </section>
      ))}
    </div>
  </article>
);

const CaseStudyDetailPage = ({ caseStudy = null, template = false }) => {
  useEffect(() => {
    if (template || !caseStudy?.id) return;
    trackAnalyticsEvent(
      ANALYTICS_EVENTS.caseStudyView,
      { case_study_id: caseStudy.id },
      {
        dedupeKey: `case_study_view:${caseStudy.id}`,
        dedupeWindowMs: 1_000,
      },
    );
  }, [caseStudy, template]);

  return (
  <div className="min-h-screen bg-amazon-cream">
    <SkipLink />
    <CaseStudyPageHeader />
    <main id="main-content">
      <section className="bg-amazon-dark py-14 text-white md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Case Studies', href: '/case-studies' },
              { label: template ? 'Case Study Template' : caseStudy?.clientLabel ?? 'Case Study' },
            ]}
            className="mb-10 text-gray-300"
          />
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-300">
            {template ? 'Future SEO page structure' : 'Client case study'}
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            {template ? 'Detailed Amazon case-study template' : caseStudy?.clientLabel}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-300">
            {template
              ? 'This route defines the evidence and content required for a future indexable case-study page. It contains no invented client result.'
              : caseStudy?.verification.disclosure}
          </p>
          <AmazonPartnerBadge
            kind="spn"
            href={SITE_CONFIG.spnLinks.accountManagement}
            label="India · Account Management"
            compact
            className="mt-7"
          />
        </div>
      </section>

      <section className="py-14 md:py-20" aria-label={template ? 'Case study template content' : 'Case study details'}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          {template ? <CaseStudyTemplate /> : <CaseStudyCard caseStudy={caseStudy} detailed />}
        </div>
      </section>

      <section className="bg-white py-14" aria-labelledby="detail-audit-heading">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <h2 id="detail-audit-heading" className="text-2xl font-black text-amazon-dark">
              Request an evidence-led Amazon account review
            </h2>
            <p className="mt-2 text-gray-700">Start with the audit form on the homepage.</p>
          </div>
          <a
            href={PRIMARY_AUDIT_ROUTE}
            onClick={() => trackPrimaryCtaClick({
              ctaLocation: 'case_study_detail',
              ctaLabel: PRIMARY_CTA_LABEL,
            })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3.5 font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            {PRIMARY_CTA_LABEL}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
    <Footer />
  </div>
  );
};

export default CaseStudyDetailPage;
