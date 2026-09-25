import { ArrowRight, FileCheck2 } from 'lucide-react';
import { getPublishedCaseStudyBySlug } from '../../content/caseStudies.ts';
import { getCaseStudyPath } from '../../config/routes.js';

const RelevantCaseStudy = ({ slug = null }) => {
  const caseStudy = slug ? getPublishedCaseStudyBySlug(slug) : null;

  if (!caseStudy) return null;

  return (
    <section className="rounded-2xl border border-primary-200 bg-amazon-cream p-6 sm:p-8" aria-labelledby="relevant-case-study-heading">
      <FileCheck2 className="h-7 w-7 text-primary-700" aria-hidden="true" />
      <h2 id="relevant-case-study-heading" className="mt-4 text-2xl font-black text-amazon-dark">
        Relevant case study
      </h2>
      <p className="mt-3 leading-relaxed text-gray-700">Explore the account context, work performed and results for this service.</p>
      <a href={getCaseStudyPath(caseStudy.slug)} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary-800 underline underline-offset-4">Read {caseStudy.clientLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
    </section>
  );
};

export default RelevantCaseStudy;
