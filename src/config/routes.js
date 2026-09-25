export const HOME_ROUTE = '/';
export const PRIMARY_SERVICE_INQUIRY = '/contact';
export const CASE_STUDIES_ROUTE = '/case-studies';
export const CASE_STUDY_TEMPLATE_ROUTE = '/case-studies/template';

export const MARKETING_ROUTES = Object.freeze({
  amazonPpcManagement: Object.freeze({
    key: 'amazonPpcManagement',
    path: '/amazon-ppc-management',
    kind: 'service',
    serviceId: 'amazon-ppc-profitability',
  }),
  amazonAccountManagement: Object.freeze({
    key: 'amazonAccountManagement',
    path: '/amazon-account-management',
    kind: 'service',
    serviceId: 'account-management-health',
  }),
  amazonListingOptimization: Object.freeze({
    key: 'amazonListingOptimization',
    path: '/amazon-listing-optimization',
    kind: 'service',
    serviceId: 'listing-seo-catalog',
  }),
  amazonAPlusContent: Object.freeze({
    key: 'amazonAPlusContent',
    path: '/amazon-a-plus-content',
    kind: 'service',
    serviceId: 'brand-content-storefront',
  }),
  amazonGlobalSelling: Object.freeze({
    key: 'amazonGlobalSelling',
    path: '/amazon-global-selling',
    kind: 'service',
    serviceId: 'india-global-expansion',
  }),
  about: Object.freeze({
    key: 'about',
    path: '/about',
    kind: 'about',
  }),
  contact: Object.freeze({
    key: 'contact',
    path: '/contact',
    kind: 'contact',
  }),
});

export const SERVICE_PAGE_PATHS = Object.freeze({
  'amazon-ppc-profitability': MARKETING_ROUTES.amazonPpcManagement.path,
  'account-management-health': MARKETING_ROUTES.amazonAccountManagement.path,
  'listing-seo-catalog': MARKETING_ROUTES.amazonListingOptimization.path,
  'brand-content-storefront': MARKETING_ROUTES.amazonAPlusContent.path,
  'india-global-expansion': MARKETING_ROUTES.amazonGlobalSelling.path,
});

export const getCaseStudyPath = (slug) => `${CASE_STUDIES_ROUTE}/${encodeURIComponent(slug)}`;

export const LEGAL_ROUTES = Object.freeze({
  privacy: Object.freeze({
    key: 'privacy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
  }),
  terms: Object.freeze({
    key: 'terms',
    path: '/terms-of-service',
    title: 'Terms of Service',
  }),
  cookie: Object.freeze({
    key: 'cookie',
    path: '/cookie-policy',
    title: 'Cookie Policy',
  }),
});

export const LEGAL_PATHS = Object.freeze(
  Object.fromEntries(
    Object.entries(LEGAL_ROUTES).map(([key, route]) => [key, route.path]),
  ),
);

export const normalizePathname = (pathname = HOME_ROUTE) => {
  const pathWithoutQuery = pathname.split(/[?#]/, 1)[0] || HOME_ROUTE;
  const withoutIndex = pathWithoutQuery.replace(/\/index\.html$/, '') || HOME_ROUTE;

  if (withoutIndex === HOME_ROUTE) return HOME_ROUTE;
  return withoutIndex.replace(/\/+$/, '');
};

export const getLegalRoute = (pathname) => {
  const normalizedPath = normalizePathname(pathname);
  return Object.values(LEGAL_ROUTES).find((route) => route.path === normalizedPath) ?? null;
};

export const getMarketingRoute = (pathname) => {
  const normalizedPath = normalizePathname(pathname);
  return Object.values(MARKETING_ROUTES).find((route) => route.path === normalizedPath) ?? null;
};

export const getCaseStudySlug = (pathname) => {
  const normalizedPath = normalizePathname(pathname);
  const prefix = `${CASE_STUDIES_ROUTE}/`;

  if (!normalizedPath.startsWith(prefix) || normalizedPath === CASE_STUDY_TEMPLATE_ROUTE) {
    return null;
  }

  const encodedSlug = normalizedPath.slice(prefix.length);
  if (encodedSlug.length === 0 || encodedSlug.includes('/')) return null;

  try {
    const slug = decodeURIComponent(encodedSlug);
    return slug.length > 0 && !slug.includes('/') ? slug : null;
  } catch {
    return null;
  }
};

export const resolveSiteRoute = (pathname) => {
  const normalizedPath = normalizePathname(pathname);
  const legalRoute = getLegalRoute(normalizedPath);
  const marketingRoute = getMarketingRoute(normalizedPath);
  const caseStudySlug = getCaseStudySlug(normalizedPath);

  if (legalRoute) return { type: 'legal', route: legalRoute };
  if (marketingRoute) return { type: 'marketing', route: marketingRoute };
  if (normalizedPath === HOME_ROUTE) return { type: 'home' };
  if (normalizedPath === CASE_STUDIES_ROUTE) return { type: 'case-studies' };
  if (normalizedPath === CASE_STUDY_TEMPLATE_ROUTE) return { type: 'case-study-template' };
  if (caseStudySlug) return { type: 'case-study-detail', slug: caseStudySlug };
  return { type: 'not-found', path: normalizedPath };
};
