import { Building2, Compass, Layers3 } from 'lucide-react';
import { HOME_SECTION_IDS } from '../../../config/navigation.js';

const clientProfiles = [
  {
    icon: Building2,
    title: 'Established Amazon sellers',
    description: 'For teams that need more structured account operations, issue management, and performance oversight.',
  },
  {
    icon: Layers3,
    title: 'Brands improving execution',
    description: 'For businesses aligning advertising, catalog quality, and brand content around clear commercial priorities.',
  },
  {
    icon: Compass,
    title: 'Teams planning what comes next',
    description: 'For sellers preparing a launch or marketplace expansion who need readiness review and practical planning.',
  },
];

const IdealClients = () => (
  <section
    id={HOME_SECTION_IDS.idealClients}
    aria-labelledby="ideal-clients-heading"
    className="scroll-mt-20 bg-amazon-cream py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-700">Who we support</p>
        <h2 id="ideal-clients-heading" className="mt-3 text-3xl font-black text-amazon-dark md:text-4xl">
          Built for brands that need clearer Amazon execution.
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {clientProfiles.map((profile) => (
          <article key={profile.title} className="rounded-2xl border border-primary-200 bg-white p-7 shadow-sm">
            <profile.icon className="h-7 w-7 text-primary-600" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-extrabold text-amazon-dark">{profile.title}</h3>
            <p className="mt-3 leading-relaxed text-gray-600">{profile.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default IdealClients;
