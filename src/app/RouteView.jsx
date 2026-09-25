import { Suspense, lazy, useEffect, useMemo } from 'react';
import { getPublishedCaseStudyBySlug } from '../content/caseStudies.ts';
import { resolveSiteRoute } from '../config/routes.js';
import { SITE_CONFIG } from '../config/site.js';

const HomePage = lazy(() => import('../pages/home/HomePage.jsx'));
const ServicePage = lazy(() => import('../pages/services/ServicePage.jsx'));
const AboutPage = lazy(() => import('../pages/about/AboutPage.jsx'));
const ContactPage = lazy(() => import('../pages/contact/ContactPage.jsx'));
const CaseStudiesPage = lazy(() => import('../pages/case-studies/CaseStudiesPage.jsx'));
const CaseStudyDetailPage = lazy(() => import('../pages/case-studies/CaseStudyDetailPage.jsx'));
const LegalNoticePage = lazy(() => import('../pages/legal/LegalNoticePage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

const setMetaContent = (name, content) => {
  const meta = document.querySelector(`meta[name="${name}"]`) ?? document.createElement('meta');
  meta.setAttribute('name', name);
  meta.setAttribute('content', content);
  if (!meta.parentNode) document.head.appendChild(meta);
};

const RouteView = ({ pathname, requestedService }) => {
  const currentRoute = useMemo(() => resolveSiteRoute(pathname), [pathname]);
  const caseStudy = currentRoute.type === 'case-study-detail'
    ? getPublishedCaseStudyBySlug(currentRoute.slug)
    : null;

  useEffect(() => {
    if (currentRoute.type === 'case-study-detail' && caseStudy) {
      document.title = `${caseStudy.clientLabel} Amazon Case Study | ${SITE_CONFIG.brandName}`;
      setMetaContent('robots', 'index, follow');
      setMetaContent(
        'description',
        `${caseStudy.productCategory ?? 'Amazon'} growth case study for ${caseStudy.marketplace ?? 'Amazon marketplaces'} with documented before-and-after evidence.`,
      );
    } else if (currentRoute.type === 'not-found' || (currentRoute.type === 'case-study-detail' && !caseStudy)) {
      setMetaContent('robots', 'noindex, nofollow');
    }
  }, [currentRoute, caseStudy]);

  let page;
  switch (currentRoute.type) {
    case 'home': page = <HomePage />; break;
    case 'legal': page = <LegalNoticePage route={currentRoute.route} />; break;
    case 'marketing':
      if (currentRoute.route.kind === 'service') page = <ServicePage route={currentRoute.route} />;
      else if (currentRoute.route.kind === 'about') page = <AboutPage />;
      else page = <ContactPage requestedService={requestedService} />;
      break;
    case 'case-studies': page = <CaseStudiesPage />; break;
    case 'case-study-template': page = <CaseStudyDetailPage template />; break;
    case 'case-study-detail':
      page = caseStudy ? <CaseStudyDetailPage caseStudy={caseStudy} /> : <NotFoundPage />;
      break;
    default: page = <NotFoundPage />;
  }

  return (
    <Suspense fallback={(
      <main id="main-content" className="mx-auto min-h-screen max-w-3xl px-4 py-24">
        <p role="status" className="font-bold text-amazon-dark">Loading page…</p>
      </main>
    )}>
      {page}
    </Suspense>
  );
};

export default RouteView;
