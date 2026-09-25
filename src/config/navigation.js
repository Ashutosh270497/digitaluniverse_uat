export const HOME_SECTION_IDS = {
  home: 'home',
  performance: 'performance',
  idealClients: 'ideal-clients',
  caseStudies: 'case-studies',
  services: 'services',
  aiServices: 'ai-services',
  process: 'process',
  about: 'about',
  testimonials: 'testimonials',
  engagement: 'engagement',
  faq: 'faq',
  audit: 'book-audit',
};

export const PRIMARY_NAV_ITEMS = [
  { label: 'Amazon Services', href: `#${HOME_SECTION_IDS.services}` },
  { label: 'AI Services', href: `#${HOME_SECTION_IDS.aiServices}` },
  { label: 'Results', href: '#sales-snapshots' },
  { label: 'Process', href: `#${HOME_SECTION_IDS.process}` },
  { label: 'About', href: `#${HOME_SECTION_IDS.about}` },
  { label: 'FAQ', href: `#${HOME_SECTION_IDS.faq}` },
];

export const getHomepageHref = (href) => (href.startsWith('#') ? `/${href}` : href);
