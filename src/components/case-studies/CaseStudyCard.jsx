import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import {
  CASE_STUDY_METRIC_KEYS,
  CASE_STUDY_METRIC_LABELS,
  getPublishableAssets,
  getPublishableTestimonial,
} from '../../content/caseStudies.ts';
import { getCaseStudyPath } from '../../config/routes.js';

const MetricValue = ({ metric }) => (
  <div>
    <p className="font-extrabold text-amazon-dark">
      {metric.value ?? 'Not provided'}
    </p>
    <p className="mt-1 text-xs leading-relaxed text-gray-600">
      {metric.value === null
        ? metric.missingReason ?? 'This metric was not supplied.'
        : metric.timePeriod}
    </p>
  </div>
);

const CaseStudyMetricTable = ({ caseStudy }) => (
  <div className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white">
    <table className="w-full table-fixed text-left text-sm">
      <caption className="sr-only">Starting and ending performance metrics</caption>
      <thead className="bg-amazon-dark text-white">
        <tr>
          <th scope="col" className="w-[30%] px-3 py-3 font-bold sm:px-4">Metric</th>
          <th scope="col" className="w-[35%] px-3 py-3 font-bold sm:px-4">Before</th>
          <th scope="col" className="w-[35%] px-3 py-3 font-bold sm:px-4">After</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {CASE_STUDY_METRIC_KEYS.map((key) => (
          <tr key={key} className="align-top">
            <th scope="row" className="px-3 py-4 font-bold text-gray-700 sm:px-4">
              {CASE_STUDY_METRIC_LABELS[key]}
            </th>
            <td className="px-3 py-4 sm:px-4">
              <MetricValue metric={caseStudy.startingMetrics[key]} />
            </td>
            <td className="px-3 py-4 sm:px-4">
              <MetricValue metric={caseStudy.endingMetrics[key]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CaseStudyCard = ({ caseStudy, detailed = false }) => {
  const approvedAssets = getPublishableAssets(caseStudy);
  const approvedTestimonial = getPublishableTestimonial(caseStudy);

  return (
    <article className="rounded-2xl border border-gray-200 bg-amazon-cream p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary-700">
            {caseStudy.productCategory ?? 'Product category not provided'}
          </p>
          <h3 className="mt-2 text-2xl font-black text-amazon-dark">{caseStudy.clientLabel}</h3>
          <p className="mt-2 text-sm text-gray-600">
            {caseStudy.marketplace ?? 'Marketplace not provided'} ·{' '}
            {caseStudy.timePeriod ?? 'Time period not provided'}
          </p>
        </div>
        <span className="rounded-full border border-primary-300 bg-white px-3 py-1 text-xs font-bold text-primary-800">
          Evidence reviewed
        </span>
      </div>

      <div className={`mt-7 grid gap-6 ${detailed ? 'lg:grid-cols-2' : ''}`}>
        <div>
          <h4 className="font-extrabold text-amazon-dark">Initial problem</h4>
          <p className="mt-2 leading-relaxed text-gray-700">
            {caseStudy.initialProblem ?? 'Not provided.'}
          </p>
        </div>
        <div>
          <h4 className="font-extrabold text-amazon-dark">Work performed</h4>
          {caseStudy.workPerformed.length > 0 ? (
            <ul className="mt-2 space-y-2 text-gray-700">
              {caseStudy.workPerformed.map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-gray-700">Not provided.</p>
          )}
        </div>
      </div>

      <CaseStudyMetricTable caseStudy={caseStudy} />

      {approvedAssets.length > 0 && (
        <div className={`mt-7 grid gap-4 ${approvedAssets.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {approvedAssets.map((asset) => (
            <figure key={`${asset.kind}-${asset.src}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <img
                src={asset.src}
                alt={asset.alt}
                width={asset.width}
                height={asset.height}
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full object-contain"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="flex gap-2 p-4 text-xs leading-relaxed text-gray-600">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
                <span>
                  {asset.kind === 'seller-central-screenshot'
                    ? 'Redacted Seller Central source evidence. Revenue imagery supports the underlying data but does not prove agency attribution by itself.'
                    : 'Client-approved supporting asset.'}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="mt-7 rounded-xl border border-primary-200 bg-white p-5">
        <h4 className="font-extrabold text-amazon-dark">Verification and disclosure</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {caseStudy.verification.disclosure}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Agency-impact basis: {caseStudy.verification.agencyImpactMethodology}
        </p>
      </div>

      {detailed && approvedTestimonial && (
        <figure className="mt-7 rounded-xl border-l-4 border-primary-500 bg-white p-6">
          <blockquote className="text-lg leading-relaxed text-gray-700">
            “{approvedTestimonial.quote}”
          </blockquote>
          <figcaption className="mt-5 font-extrabold text-amazon-dark">
            {approvedTestimonial.attribution}
            {approvedTestimonial.role && (
              <span className="font-normal text-gray-600"> · {approvedTestimonial.role}</span>
            )}
          </figcaption>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            <span className="font-bold text-gray-800">How this feedback was checked:</span>{' '}
            {approvedTestimonial.verificationExplanation}
          </p>
        </figure>
      )}

      {!detailed && (
        <a
          href={getCaseStudyPath(caseStudy.slug)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg font-extrabold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Read the complete case study
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </article>
  );
};

export default CaseStudyCard;
