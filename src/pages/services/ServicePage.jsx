import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { PROCESS_STEPS, SERVICES } from '../../content/serviceContent.ts';
import { MARKETING_ROUTES, SERVICE_PAGE_PATHS } from '../../config/routes.js';
import SpnServiceLinks from '../../components/ui/SpnServiceLinks.jsx';
import { ANALYTICS_EVENTS, trackAnalyticsEvent, trackPrimaryCtaClick } from '../../analytics/index.js';
import BulletList from '../../components/ui/BulletList.jsx';
import ConversionSection from '../../features/lead-capture/ConversionSection.jsx';
import { PRIMARY_AUDIT_ROUTE } from '../../features/lead-capture/primaryCta.js';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import RelevantCaseStudy from '../../components/case-studies/RelevantCaseStudy.jsx';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import { getSeoRoute } from '../../config/seo.js';

const ServicePage = ({ route }) => {
  const seoRoute = getSeoRoute(route.path);
  useEffect(() => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.serviceView, { service: route.serviceId }, {
      dedupeKey: `service_view:${route.serviceId}`,
      dedupeWindowMs: 1_000,
    });
  }, [route.serviceId]);
  const service = SERVICES.find((item) => item.id === route.serviceId);
  const pageContent = service.pageContent ?? {};
  const processSteps = pageContent.processSteps ?? PROCESS_STEPS;
  const relatedServices = SERVICES.filter(
    (item) => item.id !== service.id && SERVICE_PAGE_PATHS[item.id],
  ).slice(0, 3);

  return (
    <MarketingLayout>
      <section className="bg-amazon-dark py-14 text-white md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: seoRoute.breadcrumbLabel }]}
            className="text-gray-300"
          />
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.18em] text-primary-300">
            {service.title}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{seoRoute.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-300">{service.summary}</p>
          <p className="mt-4 max-w-3xl leading-relaxed text-gray-300">
            <span className="font-extrabold text-white">{pageContent.audienceLabel ?? 'Who it is for:'}</span> {service.whoItIsFor}
          </p>
          {service.spnServiceKey && (
            <div className="mt-7">
              <SpnServiceLinks serviceKey={service.spnServiceKey} heading={pageContent.spnHeading} dark />
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-14 md:py-20" aria-labelledby="service-problems-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <h2 id="service-problems-heading" className="text-3xl font-black text-amazon-dark">
              {pageContent.problemsHeading ?? 'Problems this service addresses'}
            </h2>
            <BulletList items={service.problemsSolved} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-amazon-dark">{pageContent.outcomeHeading ?? 'Primary outcome'}</h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">{service.primaryOutcome}</p>
            {pageContent.outcomeBenefits ? (
              <BulletList items={pageContent.outcomeBenefits} />
            ) : (
              <p className="mt-4 leading-relaxed text-gray-600">
                The proposal must define the baseline, measures, time period, responsibilities, and limits.
                Targets are not guarantees.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-amazon-cream py-14 md:py-20" aria-labelledby="service-deliverables-heading">
        <div className={`mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:px-10 ${pageContent.deliverableGroups ? 'lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]' : 'lg:grid-cols-2'}`}>
          <div>
            <h2 id="service-deliverables-heading" className="text-3xl font-black text-amazon-dark">
              {pageContent.deliverablesHeading ?? 'Deliverables considered in scope'}
            </h2>
            {pageContent.deliverableGroups ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {pageContent.deliverableGroups.map((group) => (
                  <div key={group.title} data-deliverable-group className="rounded-2xl border border-primary-200 bg-white p-5">
                    <h3 className="text-lg font-extrabold leading-snug text-amazon-dark">{group.title}</h3>
                    <BulletList items={group.items} />
                  </div>
                ))}
              </div>
            ) : <BulletList items={service.deliverables} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-amazon-dark">{pageContent.clientInvolvementHeading ?? 'What we need from the client'}</h2>
            <BulletList items={service.expectedClientInvolvement} />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-amazon-dark">
            <h2 className="text-xl font-black">{pageContent.strategy?.title ?? 'A scope built around your account'}</h2>
            <p className="mt-3 leading-relaxed">
              {pageContent.strategy?.description ?? 'Your written proposal sets out the services, reporting, fees, timelines and responsibilities for your engagement. Discuss your priorities with us to define the right scope.'}
            </p>
            {pageContent.strategy && (
              <a
                href={PRIMARY_AUDIT_ROUTE}
                data-service-audit-cta
                className="button-primary mt-5"
                onClick={() => trackPrimaryCtaClick({
                  ctaLocation: 'service-strategy',
                  service: service.id,
                  ctaLabel: pageContent.strategy.ctaLabel,
                })}
              >
                {pageContent.strategy.ctaLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20" aria-labelledby="service-process-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <h2 id="service-process-heading" className="text-3xl font-black text-amazon-dark">
            How the engagement moves forward
          </h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <li key={step.number} className="rounded-2xl border border-gray-200 p-6">
                <span className="text-sm font-black text-primary-700">{step.number}</span>
                <h3 className="mt-3 font-extrabold text-amazon-dark">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-1 lg:px-10">
          <RelevantCaseStudy slug={service.relevantCaseStudySlug} />
          <aside className="rounded-2xl border border-gray-200 p-6 sm:p-8" aria-labelledby="related-services-heading">
            <h2 id="related-services-heading" className="text-2xl font-black text-amazon-dark">
              Related Amazon services
            </h2>
            <ul className="mt-5 space-y-4">
              {relatedServices.map((item) => (
                <li key={item.id}>
                  <a
                    href={SERVICE_PAGE_PATHS[item.id]}
                    className="font-extrabold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={MARKETING_ROUTES.about.path}
              className="mt-7 inline-flex items-center gap-2 font-extrabold text-primary-800 underline decoration-primary-300 underline-offset-4"
            >
              About our delivery approach
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>
      <ConversionSection />
    </MarketingLayout>
  );
};

export default ServicePage;
