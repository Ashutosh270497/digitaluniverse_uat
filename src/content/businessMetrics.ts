export type MetricScope =
  | 'gautam-soni-career'
  | 'digital-universe-pro-agency'
  | 'selected-case-study';

export type VerificationStatus = 'verified' | 'unverified';

export interface BusinessMetric {
  id: string;
  value: string;
  label: string;
  scope: MetricScope;
  timePeriod: string;
  verificationStatus: VerificationStatus;
  group: string;
  evidenceSource: string | null;
}

export interface EvidenceClaim {
  id: string;
  statement: string;
  scope: MetricScope;
  timePeriod: string;
  verificationStatus: VerificationStatus;
  evidenceSource: string | null;
}

export const METRIC_SCOPE_LABELS: Record<MetricScope, string> = {
  'gautam-soni-career': "Gautam Soni's career experience",
  'digital-universe-pro-agency': 'Digital Universe Pro agency results',
  'selected-case-study': 'Selected case-study result',
};

const unverifiedMetric = (
  id: string,
  value: string,
  label: string,
  scope: MetricScope,
  timePeriod: string,
  group: string,
): BusinessMetric => ({
  id,
  value,
  label,
  scope,
  timePeriod,
  group,
  verificationStatus: 'unverified',
  evidenceSource: null,
});

// Legacy figures are retained here for evidence review, not publication. A metric
// is eligible for display only after evidenceSource is populated and its status is
// explicitly changed to "verified".
export const BUSINESS_METRICS: readonly BusinessMetric[] = [
  unverifiedMetric('offer-first-month-discount', '30%', 'First-month discount', 'digital-universe-pro-agency', 'Offer period not specified', 'promotion'),
  unverifiedMetric('hero-revenue-generated', '$50M+', 'Revenue generated', 'digital-universe-pro-agency', 'Time period not specified', 'hero'),
  unverifiedMetric('hero-sellers-managed', '500+', 'Sellers managed', 'digital-universe-pro-agency', 'Time period not specified', 'hero'),
  unverifiedMetric('hero-ad-spend-managed', '1.8B+', 'Ad spend managed', 'digital-universe-pro-agency', 'Time period and currency not specified', 'hero'),
  unverifiedMetric('hero-marketplaces', '15+', 'Marketplaces', 'digital-universe-pro-agency', 'Current coverage; date not specified', 'market-coverage'),
  unverifiedMetric('hero-countries', '50+', 'Countries', 'digital-universe-pro-agency', 'Current coverage; date not specified', 'market-coverage'),
  unverifiedMetric('hero-support-availability', '24/7', 'Global support', 'digital-universe-pro-agency', 'Current service level; date not specified', 'market-coverage'),
  unverifiedMetric('hero-audits-this-week', '127', 'Seller audits', 'digital-universe-pro-agency', 'Current week; date not specified', 'hero-form-proof'),
  unverifiedMetric('hero-response-time', '24hr', 'Response time', 'digital-universe-pro-agency', 'Current service level; date not specified', 'hero-form-proof'),
  unverifiedMetric('hero-rating', '5-Star', 'Client rating', 'digital-universe-pro-agency', 'Time period not specified', 'credential'),
  unverifiedMetric('agency-active-sellers', '500+', 'Active sellers', 'digital-universe-pro-agency', 'Current total; date not specified', 'agency-summary'),
  unverifiedMetric('agency-revenue-2024', '$108M+', 'Revenue generated', 'digital-universe-pro-agency', '2024', 'agency-summary'),
  unverifiedMetric('agency-units-sold', '43,655+', 'Units sold', 'digital-universe-pro-agency', 'Time period not specified', 'agency-summary'),
  unverifiedMetric('agency-orders-processed', '41,953+', 'Orders processed', 'digital-universe-pro-agency', 'Time period not specified', 'agency-summary'),
  unverifiedMetric('agency-top-percent', 'Top 1%', 'Amazon partners', 'digital-universe-pro-agency', 'Time period not specified', 'credential'),
  unverifiedMetric('agency-success-rate', '98%', 'Success rate', 'digital-universe-pro-agency', 'Time period not specified', 'credential'),
  unverifiedMetric('agency-brands-worldwide', '500+', 'Brands worldwide', 'digital-universe-pro-agency', 'Time period not specified', 'brand-summary'),
  unverifiedMetric('agency-industries', '15+', 'Industries', 'digital-universe-pro-agency', 'Time period not specified', 'brand-summary'),
  unverifiedMetric('agency-categories', '25+', 'Categories', 'digital-universe-pro-agency', 'Time period not specified', 'brand-summary'),
  unverifiedMetric('agency-products-managed', '100M+', 'Products managed', 'digital-universe-pro-agency', 'Time period not specified', 'brand-summary'),
  unverifiedMetric('agency-uptime', '99.9%', 'Uptime', 'digital-universe-pro-agency', 'Time period not specified', 'brand-summary'),
  unverifiedMetric('dashboard-orders', '41,953+', 'Total orders', 'selected-case-study', 'Multiple ranges in 2025', 'dashboard-summary'),
  unverifiedMetric('dashboard-units', '43,655+', 'Units sold', 'selected-case-study', 'Multiple ranges in 2025', 'dashboard-summary'),
  unverifiedMetric('dashboard-revenue', '₹1.1Cr+', 'Revenue generated', 'selected-case-study', 'Multiple ranges in 2025', 'dashboard-summary'),
  unverifiedMetric('dashboard-client-success', '100%', 'Client success', 'selected-case-study', 'Time period not specified', 'dashboard-summary'),
  unverifiedMetric('expert-years-experience', '7+', 'Years of experience', 'gautam-soni-career', 'Career total; start date not specified', 'expert'),
  unverifiedMetric('expert-brands-helped', '500+', 'Brands helped', 'gautam-soni-career', 'Career total; time period not specified', 'expert'),
  unverifiedMetric('expert-revenue-generated', '$100M+', 'Revenue generated', 'gautam-soni-career', 'Career total; time period not specified', 'expert'),
  unverifiedMetric('expert-success-rate', '98%', 'Success rate', 'gautam-soni-career', 'Career total; time period not specified', 'expert'),
  unverifiedMetric('case-study-1-growth', '73%', 'Growth', 'selected-case-study', '12 months; dates not specified', 'case-study-1'),
  unverifiedMetric('case-study-1-revenue', '$2.9M', 'Revenue after optimization', 'selected-case-study', '12 months; dates not specified', 'case-study-1'),
  unverifiedMetric('case-study-1-dashboard-sales', '$4.66M', 'Product sales', 'selected-case-study', '2024', 'case-study-1'),
  unverifiedMetric('case-study-2-roi', '156%', 'Advertising ROI', 'selected-case-study', 'Time period not specified', 'case-study-2'),
  unverifiedMetric('case-study-2-product-lines', '5', 'Best Seller product lines', 'selected-case-study', 'Time period not specified', 'case-study-2'),
  unverifiedMetric('case-study-2-dashboard-sales', '$5.36M', 'Product sales', 'selected-case-study', '2024', 'case-study-2'),
  unverifiedMetric('case-study-3-growth', '340%', 'Sales growth', 'selected-case-study', '10 months; dates not specified', 'case-study-3'),
  unverifiedMetric('case-study-3-revenue', '$2.2M', 'Revenue after growth period', 'selected-case-study', '10 months; dates not specified', 'case-study-3'),
  unverifiedMetric('case-study-3-acos', '28%', 'Advertising cost of sale', 'selected-case-study', 'Time period not specified', 'case-study-3'),
  unverifiedMetric('case-study-3-marketplaces', '5', 'International marketplaces', 'selected-case-study', 'Time period not specified', 'case-study-3'),
  unverifiedMetric('case-study-3-dashboard-sales', '$2.86M', 'Product sales', 'selected-case-study', 'March-December 2024', 'case-study-3'),
  unverifiedMetric('live-sales-growth', '127%', 'Sales increase', 'selected-case-study', 'Time period not specified', 'simulated-live-proof'),
  unverifiedMetric('live-bestseller-rank', '#3', 'Bestseller rank in Electronics', 'selected-case-study', 'Time period not specified', 'simulated-live-proof'),
  unverifiedMetric('live-weekly-revenue', '$45,000', 'Revenue generated', 'selected-case-study', 'One week; date not specified', 'simulated-live-proof'),
  unverifiedMetric('live-daily-units', '2,500', 'Units sold', 'selected-case-study', '24 hours; date not specified', 'simulated-live-proof'),
  unverifiedMetric('live-acos', '15%', 'Advertising cost of sale', 'selected-case-study', 'Time period not specified', 'simulated-live-proof'),
  unverifiedMetric('popup-sales-growth', '340%', 'Sales increase', 'selected-case-study', 'Time period not specified', 'simulated-popup-proof'),
  unverifiedMetric('popup-acos-reduction', '45%', 'ACoS reduction', 'selected-case-study', 'Time period not specified', 'simulated-popup-proof'),
];

export const EVIDENCE_CLAIMS: readonly EvidenceClaim[] = [
  {
    id: 'award-winning-strategist',
    statement: 'Award-winning Amazon strategist',
    scope: 'gautam-soni-career',
    timePeriod: 'Award and date not specified',
    verificationStatus: 'unverified',
    evidenceSource: null,
  },
  {
    id: 'certified-ads-specialist',
    statement: 'Certified Ads Specialist',
    scope: 'digital-universe-pro-agency',
    timePeriod: 'Credential and date not specified',
    verificationStatus: 'unverified',
    evidenceSource: null,
  },
  {
    id: 'verified-service-provider',
    statement: 'Verified Service Provider',
    scope: 'digital-universe-pro-agency',
    timePeriod: 'Credential and date not specified',
    verificationStatus: 'unverified',
    evidenceSource: null,
  },
  {
    id: 'amazon-ads-verified-partner',
    statement: 'Amazon Ads Verified Partner',
    scope: 'digital-universe-pro-agency',
    timePeriod: 'Partner listing supplied by the business on 2026-09-25',
    verificationStatus: 'unverified',
    // Business-supplied link and display label; independent directory verification is pending.
    evidenceSource: 'https://advertising.amazon.com/partners/directory/details/amzn1.ads1.ma1.6l6hpvsylhggfceurmgxhx6k0/DIGITAL-UNIVERSE?sref_=suggestion',
  },
];

export const getVerifiedMetrics = (group?: string): readonly BusinessMetric[] =>
  BUSINESS_METRICS.filter(
    (metric) =>
      metric.verificationStatus === 'verified' &&
      metric.evidenceSource !== null &&
      (group === undefined || metric.group === group),
  );


// Authorized marketing highlights, revised by the business on 2026-09-26.
// These are reported figures, not independently audited case-study results.
// The reporting period has not been supplied. Do not relabel these as annual
// results or a guarantee.
export const FOUNDER_PERFORMANCE = {
  source: 'Founder-reported agency performance',
  reportedOn: '2026-09-26',
  reportingPeriod: null,
  metrics: [
    { id: 'brands-sellers', value: '50+', label: 'Brands & Sellers Supported' },
    { id: 'categories', value: '15+', label: 'Amazon Categories' },
    { id: 'marketplaces', value: '5+', label: 'Global Amazon Marketplaces' },
    { id: 'experience', value: '5+ Years', label: 'Combined Amazon Experience' },
  ],
  regions: ['Europe', 'North America', 'Asia'],
  marketplace: 'Amazon across multiple countries',
} as const;
