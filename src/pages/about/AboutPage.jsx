import { AmazonPartnerBadges } from '../../components/ui/AmazonPartnerBadge.jsx';
import expertPhotoLarge from '../../assets/amazon_pics/gautam-soni-1067.webp';
import expertPhotoSmall from '../../assets/amazon_pics/gautam-soni-600.webp';
import { AI_SERVICES } from '../../content/aiServices.ts';
import { SERVICES } from '../../content/serviceContent.ts';
import { MARKETING_ROUTES, SERVICE_PAGE_PATHS } from '../../config/routes.js';
import ConversionSection from '../../features/lead-capture/ConversionSection.jsx';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import { getSeoRoute } from '../../config/seo.js';

const AboutPage = () => {
  const seoRoute = getSeoRoute(MARKETING_ROUTES.about.path);
  return (
    <MarketingLayout>
      <section className="bg-amazon-dark py-14 text-white md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: seoRoute.breadcrumbLabel }]}
            className="text-gray-300"
          />
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.18em] text-primary-300">
            Founder-led Amazon delivery
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">{seoRoute.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-300">
            Digital Universe Pro brings together Amazon marketplace expertise and tailored AI solutions. From account growth to smarter business operations, we build around your goals and an agreed scope.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20" aria-labelledby="about-gautam-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-10">
          <img
            src={expertPhotoSmall}
            srcSet={`${expertPhotoSmall} 600w, ${expertPhotoLarge} 1067w`}
            sizes="(min-width: 1024px) 32vw, 100vw"
            alt="Gautam Soni, Amazon marketplace strategist"
            width="1067"
            height="1600"
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-2xl border-4 border-primary-400 object-cover"
          />
          <div>
            <h2 id="about-gautam-heading" className="text-3xl font-black text-amazon-dark">
              Strategy led by Gautam Soni
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              Gautam Soni brings five years of Amazon experience to advertising, product launches, listings and account planning. His focus is connecting account-level priorities with your wider business goals.
            </p>
            <p className="mt-4 leading-relaxed text-gray-700">
              Delivery is organised around the agreed Amazon workstreams, evidence available in the account,
              named responsibilities, and review points documented in the proposal.
            </p>
            <AmazonPartnerBadges className="mt-6" />
          </div>
        </div>
      </section>

      <section className="bg-amazon-cream py-14 md:py-20" aria-labelledby="about-services-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <h2 id="about-services-heading" className="text-3xl font-black text-amazon-dark">
            Explore our Amazon services
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {SERVICES.filter((service) => SERVICE_PAGE_PATHS[service.id]).map((service) => (
              <a
                key={service.id}
                href={SERVICE_PAGE_PATHS[service.id]}
                className="rounded-2xl border border-primary-200 bg-white p-6 hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <h3 className="font-extrabold text-amazon-dark">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{service.summary}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-primary-50" aria-labelledby="about-ai-heading">
        <div className="section-shell">
          <p className="eyebrow">Intelligence for everyday business</p>
          <h2 id="about-ai-heading" className="section-title">AI solutions built around your next step.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">Automate a workflow, connect your company knowledge or build an AI-enabled product. Explore the support that fits your business.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AI_SERVICES.map(service => <a key={service.id} href={`${MARKETING_ROUTES.aiServices.path}#ai-${service.id}`} className="rounded-xl border border-primary-200 bg-white p-6 font-bold text-amazon-dark hover:border-primary-600">{service.title}</a>)}
          </div>
        </div>
      </section>

      <ConversionSection />
    </MarketingLayout>
  );
};

export default AboutPage;
