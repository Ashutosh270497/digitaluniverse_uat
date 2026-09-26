import { SITE_CONFIG } from './site.js';
import { HERO_HEADLINE } from '../content/hero.js';
import {
  CASE_STUDIES_ROUTE,
  CASE_STUDY_TEMPLATE_ROUTE,
  HOME_ROUTE,
  LEGAL_ROUTES,
  MARKETING_ROUTES,
  normalizePathname,
} from './routes.js';

export const CANONICAL_ORIGIN = SITE_CONFIG.canonicalOrigin;
export const BRAND_IMAGE_PATH = '/brand/digital-universe-pro-logo.jpg';
export const BRAND_IMAGE_URL = `${CANONICAL_ORIGIN}${BRAND_IMAGE_PATH}`;

const seoRoute = ({
  key,
  path,
  entry,
  entryName,
  title,
  description,
  h1,
  breadcrumbLabel,
  indexable = true,
  kind = 'marketing',
}) =>
  Object.freeze({
    key,
    path,
    entry,
    entryName,
    title,
    description,
    h1,
    breadcrumbLabel,
    indexable,
    kind,
  });

export const SEO_ROUTES = Object.freeze([
  seoRoute({
    key: 'home',
    path: HOME_ROUTE,
    entry: 'index.html',
    entryName: 'main',
    title: 'Amazon Growth & Marketplace Services | Digital Universe Pro',
    description:
      'Grow your Amazon business with Digital Universe Pro. Explore PPC advertising, listing SEO, account management and global marketplace expansion.',
    h1: HERO_HEADLINE,
    breadcrumbLabel: 'Home',
    kind: 'home',
  }),
  seoRoute({
    key: MARKETING_ROUTES.aiServices.key,
    path: MARKETING_ROUTES.aiServices.path,
    entry: 'ai-services/index.html',
    entryName: 'aiServices',
    title: 'AI Services & Business Automation | Digital Universe Pro',
    description: 'Custom AI agents, AI-powered SaaS, RAG knowledge systems, workflow automation, AI consulting and infrastructure built around your business.',
    h1: 'AI solutions that drive real business growth.',
    breadcrumbLabel: 'AI Services',
    kind: 'ai-services',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonSpn.key,
    path: MARKETING_ROUTES.amazonSpn.path,
    entry: 'amazon-spn/index.html',
    entryName: 'amazonSpn',
    title: 'Amazon SPN Service Listings | Digital Universe Pro',
    description: 'Explore Digital Universe Pro’s Amazon SPN India listings for account management, advertising, cataloging and enhanced brand content.',
    h1: 'Explore our Amazon SPN services.',
    breadcrumbLabel: 'Amazon SPN',
    kind: 'amazon-spn',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonPpcManagement.key,
    path: MARKETING_ROUTES.amazonPpcManagement.path,
    entry: 'amazon-ppc-management/index.html',
    entryName: 'amazonPpcManagement',
    title: 'Amazon PPC Management Services | Digital Universe Pro',
    description:
      'Strategic Sponsored Products, Sponsored Brands and Sponsored Display campaigns designed to improve visibility, control ad spend and grow profitable sales.',
    h1: 'Amazon PPC Management Built for Profitable Growth',
    breadcrumbLabel: 'Amazon PPC Management',
    kind: 'service',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonAccountManagement.key,
    path: MARKETING_ROUTES.amazonAccountManagement.path,
    entry: 'amazon-account-management/index.html',
    entryName: 'amazonAccountManagement',
    title: 'Amazon Account Management Services | Digital Universe Pro',
    description:
      'End-to-end Amazon account support covering account health, Seller Support coordination, catalogue management and day-to-day operational priorities.',
    h1: 'Amazon Account Management for Smooth, Scalable Growth',
    breadcrumbLabel: 'Amazon Account Management',
    kind: 'service',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonListingOptimization.key,
    path: MARKETING_ROUTES.amazonListingOptimization.path,
    entry: 'amazon-listing-optimization/index.html',
    entryName: 'amazonListingOptimization',
    title: 'Amazon Listing Optimization Services | Digital Universe Pro',
    description:
      'Optimised titles, bullet points, descriptions and backend keywords built around relevant search terms and conversion-focused content.',
    h1: 'Amazon Listing SEO & Catalogue Optimisation That Improves Visibility',
    breadcrumbLabel: 'Amazon Listing Optimization',
    kind: 'service',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonAPlusContent.key,
    path: MARKETING_ROUTES.amazonAPlusContent.path,
    entry: 'amazon-a-plus-content/index.html',
    entryName: 'amazonAPlusContent',
    title: 'Amazon A+ Content & Storefront Services | Digital Universe Pro',
    description:
      'A+ Content, Brand Story and Amazon Storefront planning for eligible brands that need clearer product education and consistent marketplace content.',
    h1: 'Amazon A+ Content, Brand Story and Storefront planning',
    breadcrumbLabel: 'Amazon A+ Content',
    kind: 'service',
  }),
  seoRoute({
    key: MARKETING_ROUTES.amazonGlobalSelling.key,
    path: MARKETING_ROUTES.amazonGlobalSelling.path,
    entry: 'amazon-global-selling/index.html',
    entryName: 'amazonGlobalSelling',
    title: 'Amazon Global Selling Support | Digital Universe Pro',
    description:
      'India-to-global Amazon marketplace expansion planning covering readiness, launch sequencing, catalog localisation and advertising dependencies.',
    h1: 'Plan India-to-global Amazon marketplace expansion',
    breadcrumbLabel: 'Amazon Global Selling',
    kind: 'service',
  }),
  seoRoute({
    key: 'caseStudies',
    path: CASE_STUDIES_ROUTE,
    entry: 'case-studies/index.html',
    entryName: 'caseStudies',
    title: 'Amazon Sales Snapshots & Results | Digital Universe Pro',
    description:
      'Explore Amazon account sales snapshots supplied by Digital Universe Pro, with marketplace context, reporting periods and account-level results.',
    h1: 'Amazon sales snapshots and client results',
    breadcrumbLabel: 'Case Studies',
    indexable: false,
    kind: 'case-studies',
  }),
  seoRoute({
    key: MARKETING_ROUTES.about.key,
    path: MARKETING_ROUTES.about.path,
    entry: 'about/index.html',
    entryName: 'about',
    title: 'About Digital Universe Pro | Amazon & AI Solutions',
    description:
      'Meet Digital Universe Pro: founder-led Amazon marketplace support and AI services spanning agents, SaaS development, knowledge systems and workflow automation.',
    h1: 'About Digital Universe Pro',
    breadcrumbLabel: 'About',
    kind: 'about',
  }),
  seoRoute({
    key: MARKETING_ROUTES.contact.key,
    path: MARKETING_ROUTES.contact.path,
    entry: 'contact/index.html',
    entryName: 'contact',
    title: 'Contact Digital Universe Pro | Amazon & AI Projects',
    description:
      'Request an Amazon audit or discuss an AI project with Digital Universe Pro. Connect by email or WhatsApp for AI agents, SaaS, automation and consulting.',
    h1: 'Let’s talk about your next business opportunity.',
    breadcrumbLabel: 'Contact',
    kind: 'contact',
  }),
  ...Object.values(LEGAL_ROUTES).map((route) =>
    seoRoute({
      key: route.key,
      path: route.path,
      entry: `${route.path.slice(1)}/index.html`,
      entryName: route.key,
      title: `${route.title} | Digital Universe Pro`,
      description: route.key === 'privacy'
        ? 'Learn how Digital Universe Pro collects, uses, shares and protects information submitted through its website and enquiry forms.'
        : route.key === 'terms'
          ? 'Review the Digital Universe Pro Terms of Service draft and the legal details that require confirmation before it takes effect.'
          : `${route.title} route for Digital Universe Pro. Publication is pending the verified legal inputs listed on the page.`,
      h1: route.title,
      breadcrumbLabel: route.title,
      indexable: false,
      kind: 'legal',
    }),
  ),
  seoRoute({
    key: 'caseStudyTemplate',
    path: CASE_STUDY_TEMPLATE_ROUTE,
    entry: 'case-studies/template/index.html',
    entryName: 'caseStudyTemplate',
    title: 'Amazon Case Study Template | Digital Universe Pro',
    description:
      'Unpublished template defining the client permission, metric evidence and disclosures required for future Digital Universe Pro Amazon case-study pages.',
    h1: 'Detailed Amazon case-study template',
    breadcrumbLabel: 'Case Study Template',
    indexable: false,
    kind: 'case-study-template',
  }),
  seoRoute({
    key: 'notFound',
    path: '/404',
    entry: '404.html',
    entryName: 'notFound',
    title: 'Page Not Found | Digital Universe Pro',
    description: 'The requested Digital Universe Pro page could not be found.',
    h1: 'Page not found',
    breadcrumbLabel: 'Page Not Found',
    indexable: false,
    kind: 'not-found',
  }),
]);

export const INDEXABLE_SEO_ROUTES = Object.freeze(
  SEO_ROUTES.filter((route) => route.indexable),
);

export const getSeoRoute = (pathname) => {
  if (pathname === '/404.html') return SEO_ROUTES.find((route) => route.key === 'notFound') ?? null;

  const normalizedPath = normalizePathname(pathname);
  return SEO_ROUTES.find((route) => route.path === normalizedPath) ?? null;
};

export const getSeoRouteByEntry = (entry) =>
  SEO_ROUTES.find((route) => route.entry === entry.replace(/^\/+/, '')) ?? null;

export const getCanonicalUrl = (route) =>
  route.kind === 'not-found' ? null : `${CANONICAL_ORIGIN}${route.path === HOME_ROUTE ? '' : route.path}`;

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${CANONICAL_ORIGIN}/#organization`,
  name: SITE_CONFIG.brandName,
  url: CANONICAL_ORIGIN,
  logo: BRAND_IMAGE_URL,
  email: SITE_CONFIG.contact.email,
  telephone: SITE_CONFIG.contact.phoneDisplay.replaceAll(' ', '-'),
  sameAs: SITE_CONFIG.socialLinks.map(({ url }) => url),
});

export const buildBreadcrumbSchema = (route) => {
  if (route.path === HOME_ROUTE || route.kind === 'not-found') return null;

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: CANONICAL_ORIGIN,
    },
  ];

  if (route.kind === 'case-study-template') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Case Studies',
      item: `${CANONICAL_ORIGIN}${CASE_STUDIES_ROUTE}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: route.breadcrumbLabel,
    item: getCanonicalUrl(route),
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

export const buildFaqSchema = (faqItems) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export const buildStructuredData = (route, faqItems = []) => {
  const schemas = [];

  if (route.kind === 'home') schemas.push(buildOrganizationSchema());

  const breadcrumb = buildBreadcrumbSchema(route);
  if (breadcrumb) schemas.push(breadcrumb);

  if (route.kind === 'home' && faqItems.length > 0) {
    schemas.push(buildFaqSchema(faqItems));
  }

  return schemas;
};

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const buildSitemapXml = () => {
  const urls = INDEXABLE_SEO_ROUTES.map((route) => {
    const canonicalUrl = getCanonicalUrl(route);
    return `  <url>\n    <loc>${escapeXml(canonicalUrl)}</loc>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

export const buildRobotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`;
