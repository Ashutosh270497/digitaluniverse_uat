import { BUSINESS_METRICS, type BusinessMetric } from './businessMetrics.ts';

export interface MarketplaceLocation {
  id: string;
  label: string;
  shortLabel: string;
  latitude: number;
  longitude: number;
  flagAsset: string | null;
  flagSymbol: string;
  marketplaceUrl: string | null;
  active: boolean;
  verified: boolean;
  accessibleDescription: string;
  evidenceSource: string;
  directoryCode: 'US' | 'UK' | 'IN';
  headline: string;
  description: string;
  focus: readonly string[];
}

export interface MarketplaceRoute {
  id: string;
  originId: MarketplaceLocation['id'];
  destinationId: MarketplaceLocation['id'];
  active: boolean;
}

// Representative anchors for founder-confirmed support regions. These are not
// offices, shipping routes or a claim of support in every country of a continent.
export const MARKETPLACE_LOCATIONS: readonly MarketplaceLocation[] = [
  {
    id: 'north-america', label: 'North America', shortLabel: 'N. America',
    latitude: 39.8283, longitude: -98.5795, flagAsset: null, flagSymbol: '🌎',
    marketplaceUrl: null, active: true, verified: true,
    accessibleDescription: 'Explore Amazon support in North America',
    evidenceSource: 'Founder-supplied regional coverage, 2026-09-25.',
    directoryCode: 'US', headline: 'Build your next chapter in North America.',
    description: 'Connect your advertising, account operations and brand content with a plan for your chosen Amazon marketplace.',
    focus: ['PPC strategy and optimization', 'Account management', 'A+ content and storefronts'],
  },
  {
    id: 'europe', label: 'Europe', shortLabel: 'Europe',
    latitude: 50.1109, longitude: 8.6821, flagAsset: null, flagSymbol: '🌍',
    marketplaceUrl: null, active: true, verified: true,
    accessibleDescription: 'Explore Amazon support in Europe',
    evidenceSource: 'Founder-supplied regional coverage, 2026-09-25.',
    directoryCode: 'UK', headline: 'Take a focused approach to European growth.',
    description: 'Plan your next marketplace with localized listings, advertising priorities and coordinated account support.',
    focus: ['Marketplace-readiness planning', 'Localized listings and campaigns', 'Account and catalog support'],
  },
  {
    id: 'asia', label: 'Asia', shortLabel: 'Asia',
    latitude: 20.5937, longitude: 78.9629, flagAsset: null, flagSymbol: '🌏',
    marketplaceUrl: null, active: true, verified: true,
    accessibleDescription: 'Explore Amazon support in Asia',
    evidenceSource: 'Founder-supplied regional coverage, 2026-09-25.',
    directoryCode: 'IN', headline: 'Turn your next opportunity into a clear plan.',
    description: 'Bring together account health, product content and advertising to support your Amazon business in the region.',
    focus: ['Account health and operations', 'Listing and content optimization', 'Product launch planning'],
  },
];

export const VERIFIED_MARKETPLACE_LOCATIONS = MARKETPLACE_LOCATIONS.filter(
  (location) => location.active && location.verified,
);

export const MARKETPLACE_ROUTES: readonly MarketplaceRoute[] = [
  { id: 'north-america-europe', originId: 'north-america', destinationId: 'europe', active: true },
  { id: 'europe-asia', originId: 'europe', destinationId: 'asia', active: true },
];

export const COVERAGE_METRIC_IDS = [
  'hero-marketplaces',
  'hero-countries',
  'hero-support-availability',
] as const;

export const COVERAGE_METRIC_SLOTS: readonly BusinessMetric[] = COVERAGE_METRIC_IDS.map((id) => {
  const metric = BUSINESS_METRICS.find((candidate) => candidate.id === id);
  if (!metric) throw new Error(`Missing centralized coverage metric: ${id}`);
  return metric;
});

export const getVerifiedCoverageMetrics = (): readonly BusinessMetric[] =>
  COVERAGE_METRIC_SLOTS.filter(
    (metric) => metric.verificationStatus === 'verified' && metric.evidenceSource !== null,
  );
