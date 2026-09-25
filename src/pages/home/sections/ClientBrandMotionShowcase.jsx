import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { getApprovedClientBrandsByRegion } from '../../../content/socialProof.ts';

const clientGroups = [
  {
    id: 'international-client-rail',
    heading: 'International Clients',
    brands: getApprovedClientBrandsByRegion('International'),
    direction: 'forward',
    duration: '34s',
  },
  {
    id: 'indian-client-rail',
    heading: 'Indian Clients',
    brands: getApprovedClientBrandsByRegion('India'),
    direction: 'reverse',
    duration: '27s',
  },
];

const ClientBrandRail = ({ brands, labelledBy, direction, duration }) => (
  <div
    className="client-logo-viewport mt-4"
    role="region"
    aria-labelledby={labelledBy}
    tabIndex={0}
  >
    <ul
      className="client-logo-track"
      aria-labelledby={labelledBy}
      data-direction={direction}
      style={{
        '--client-logo-duration': duration,
        animationDirection: direction === 'reverse' ? 'alternate-reverse' : 'alternate',
      }}
    >
      {brands.map((brand) => (
        <li
          key={brand.id}
          data-client-brand-motion-id={brand.id}
          className="flex w-[250px] shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-lg sm:w-[290px]"
        >
          <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-3 sm:w-32">
            <img
              src={brand.logo}
              alt=""
              width={brand.logoWidth}
              height={brand.logoHeight}
              loading="eager"
              decoding="async"
              style={{ transform: `scale(${brand.displayScale ?? 1})` }}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="min-w-0 break-words text-sm font-bold leading-snug text-white sm:text-base">
            {brand.name}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const ClientBrandMotionShowcase = () => {
  const [motionPaused, setMotionPaused] = useState(false);

  return (
    <section
      id="client-brand-motion"
      aria-labelledby="client-brand-motion-heading"
      data-motion-paused={motionPaused}
      className="overflow-hidden border-y border-white/10 bg-amazon-dark py-14 text-white md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary-400">
            Client brand experience
          </p>
          <h2
            id="client-brand-motion-heading"
            className="mt-3 text-3xl font-black text-white md:text-4xl"
          >
            Amazon Marketplace Support Across Indian and International Brands
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-300">
            A moving view of the same approved brands represented in our marketplace management,
            advertising, listing optimisation and growth-strategy work.
          </p>

          <button
            type="button"
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((isPaused) => !isPaused)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary-400/60 px-4 py-2 text-sm font-bold text-primary-300 hover:border-primary-300 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 motion-reduce:hidden"
          >
            {motionPaused ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
            {motionPaused ? 'Resume brand movement' : 'Pause brand movement'}
          </button>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {clientGroups.map((group) => (
          <div key={group.id}>
            <h3
              id={group.id}
              className="mx-auto max-w-7xl px-4 text-lg font-extrabold text-primary-300 sm:px-6 sm:text-xl lg:px-10"
            >
              {group.heading}
            </h3>
            <ClientBrandRail
              brands={group.brands}
              labelledBy={group.id}
              direction={group.direction}
              duration={group.duration}
            />
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl px-4 text-center text-sm leading-relaxed text-gray-400 sm:px-6">
        Client logos are shown from the existing approved website content. No client count,
        revenue total, uptime figure or outcome guarantee is implied.
      </p>
    </section>
  );
};

export default ClientBrandMotionShowcase;
