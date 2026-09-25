import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  FileSignature,
  SlidersHorizontal,
} from 'lucide-react';
import { HOME_SECTION_IDS } from '../../../config/navigation.js';
import { ENGAGEMENT_TERMS } from '../../../content/serviceContent.ts';

const termIcons = {
  'pricing-model': CircleDollarSign,
  'minimum-engagement': FileSignature,
  'pricing-factors': SlidersHorizontal,
  'onboarding-timeline': CalendarClock,
  'starting-price': CircleDollarSign,
};

const EngagementExpectations = () => (
  <section
    id={HOME_SECTION_IDS.engagement}
    aria-labelledby="engagement-heading"
    className="scroll-mt-20 bg-amazon-cream py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-700">
          Engagement and pricing expectations
        </p>
        <h2 id="engagement-heading" className="mt-3 text-3xl font-black text-amazon-dark md:text-4xl">
          Commercial terms must be clear before you engage us.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-gray-700">
          The repository does not contain approved public pricing or contract terms. The fields below
          are intentionally marked as missing instead of presenting an estimate as a commitment.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {ENGAGEMENT_TERMS.map((term) => {
          const Icon = termIcons[term.key] ?? AlertTriangle;

          return (
            <article key={term.key} className="rounded-2xl border border-primary-200 bg-white p-6">
              <Icon className="h-7 w-7 text-primary-700" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-extrabold text-amazon-dark">{term.label}</h3>
              {term.value ? (
                <p className="mt-3 leading-relaxed text-gray-700">{term.value}</p>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-900">
                    Business input required
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-950">{term.missingMessage}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-amazon-dark p-6 text-white sm:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-primary-300" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-black">Check the written proposal before signing</h3>
            <p className="mt-3 max-w-5xl leading-relaxed text-gray-300">
              It should name the services, ASINs and marketplaces, deliverables, exclusions, client
              responsibilities, reporting cadence, measurement definitions, fees, media-spend treatment,
              term, renewal and cancellation rules, onboarding conditions, and expected start date.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default EngagementExpectations;
