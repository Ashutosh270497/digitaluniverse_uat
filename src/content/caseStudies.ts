export type CaseStudyVerificationStatus = 'unverified' | 'verified';
export type CaseStudyPublicationStatus = 'draft' | 'published';
export type CaseStudyMetricKey =
  | 'acos'
  | 'tacos'
  | 'revenue'
  | 'conversionRate'
  | 'organicSalesShare';

export interface CaseStudyMetric {
  value: string | null;
  timePeriod: string | null;
  verificationStatus: CaseStudyVerificationStatus;
  evidenceReference: string | null;
  missingReason: string | null;
}

export interface CaseStudyMetricSnapshot {
  acos: CaseStudyMetric;
  tacos: CaseStudyMetric;
  revenue: CaseStudyMetric;
  conversionRate: CaseStudyMetric;
  organicSalesShare: CaseStudyMetric;
}

export interface CaseStudyTestimonial {
  quote: string;
  attribution: string;
  role: string | null;
  verificationExplanation: string;
  permissionReference: string;
}

export interface CaseStudyAsset {
  kind: 'client-logo' | 'seller-central-screenshot' | 'product-image';
  src: string;
  alt: string;
  width: number;
  height: number;
  clientApproved: boolean;
  permissionReference: string | null;
  redacted: boolean;
  evidenceRole: 'source-evidence' | 'context-only';
}

export interface CaseStudyVerification {
  status: CaseStudyVerificationStatus;
  performanceEvidenceReference: string | null;
  agencyImpactMethodology: string | null;
  publicationPermissionReference: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  disclosure: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  clientLabel: string;
  clientIsAnonymous: boolean;
  productCategory: string | null;
  marketplace: string | null;
  initialProblem: string | null;
  startingMetrics: CaseStudyMetricSnapshot;
  workPerformed: readonly string[];
  endingMetrics: CaseStudyMetricSnapshot;
  timePeriod: string | null;
  verification: CaseStudyVerification;
  testimonial: CaseStudyTestimonial | null;
  clientApprovedLogoOrImage: CaseStudyAsset | null;
  supportingAssets: readonly CaseStudyAsset[];
  publicationStatus: CaseStudyPublicationStatus;
  strengthRank: number;
  legacyClaimIds: readonly string[];
}

export const ANONYMISED_CLIENT_DISCLOSURE =
  'Client identity withheld with permission; performance data verified from Seller Central.';

export const CASE_STUDY_METRIC_LABELS: Record<CaseStudyMetricKey, string> = {
  acos: 'ACoS',
  tacos: 'TACoS',
  revenue: 'Revenue',
  conversionRate: 'Conversion rate',
  organicSalesShare: 'Organic sales share',
};

export const CASE_STUDY_METRIC_KEYS: readonly CaseStudyMetricKey[] = [
  'acos',
  'tacos',
  'revenue',
  'conversionRate',
  'organicSalesShare',
];

const missingMetric = (missingReason: string): CaseStudyMetric => ({
  value: null,
  timePeriod: null,
  verificationStatus: 'unverified',
  evidenceReference: null,
  missingReason,
});

const missingSnapshot = (missingReason: string): CaseStudyMetricSnapshot => ({
  acos: missingMetric(missingReason),
  tacos: missingMetric(missingReason),
  revenue: missingMetric(missingReason),
  conversionRate: missingMetric(missingReason),
  organicSalesShare: missingMetric(missingReason),
});

const unpublishedLegacyStudy = (
  id: string,
  legacyClaimIds: readonly string[],
): CaseStudy => ({
  id,
  slug: id,
  clientLabel: 'Client identity not documented',
  clientIsAnonymous: true,
  productCategory: null,
  marketplace: null,
  initialProblem: null,
  startingMetrics: missingSnapshot(
    'A source-dated starting value has not been supplied for this legacy result set.',
  ),
  workPerformed: [],
  endingMetrics: missingSnapshot(
    'Legacy figures are excluded until a source export, metric definition, and matching time period are documented.',
  ),
  timePeriod: null,
  verification: {
    status: 'unverified',
    performanceEvidenceReference: null,
    agencyImpactMethodology: null,
    publicationPermissionReference: null,
    verifiedBy: null,
    verifiedAt: null,
    disclosure:
      'Unpublished legacy result set. Raw revenue imagery and unsupported figures do not establish agency impact.',
  },
  testimonial: null,
  clientApprovedLogoOrImage: null,
  supportingAssets: [],
  publicationStatus: 'draft',
  strengthRank: Number.MAX_SAFE_INTEGER,
  legacyClaimIds,
});

// These records preserve only the inventory relationship to earlier claims. They
// intentionally contain no publishable client data, metrics, testimonial, logo,
// or screenshot because the repository has no matching evidence or permission.
export const CASE_STUDIES: readonly CaseStudy[] = [
  unpublishedLegacyStudy('legacy-case-study-01', [
    'case-study-1-growth',
    'case-study-1-revenue',
    'case-study-1-dashboard-sales',
  ]),
  unpublishedLegacyStudy('legacy-case-study-02', [
    'case-study-2-roi',
    'case-study-2-product-lines',
    'case-study-2-dashboard-sales',
  ]),
  unpublishedLegacyStudy('legacy-case-study-03', [
    'case-study-3-growth',
    'case-study-3-revenue',
    'case-study-3-acos',
    'case-study-3-marketplaces',
    'case-study-3-dashboard-sales',
  ]),
];

const hasText = (value: string | null): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const metricIsVerified = (metric: CaseStudyMetric): boolean =>
  hasText(metric.value) &&
  hasText(metric.timePeriod) &&
  metric.verificationStatus === 'verified' &&
  hasText(metric.evidenceReference);

const hasVerifiedResultMetric = (caseStudy: CaseStudy): boolean =>
  CASE_STUDY_METRIC_KEYS.some((key) => metricIsVerified(caseStudy.endingMetrics[key]));

export const isCaseStudyPublishable = (caseStudy: CaseStudy): boolean =>
  caseStudy.publicationStatus === 'published' &&
  caseStudy.verification.status === 'verified' &&
  hasText(caseStudy.verification.performanceEvidenceReference) &&
  hasText(caseStudy.verification.agencyImpactMethodology) &&
  hasText(caseStudy.verification.publicationPermissionReference) &&
  (!caseStudy.clientIsAnonymous ||
    caseStudy.verification.disclosure === ANONYMISED_CLIENT_DISCLOSURE) &&
  hasVerifiedResultMetric(caseStudy);

export const getPublishedCaseStudies = (): readonly CaseStudy[] =>
  CASE_STUDIES.filter(isCaseStudyPublishable).sort(
    (first, second) => first.strengthRank - second.strengthRank,
  );

export const getFeaturedCaseStudies = (limit = 3): readonly CaseStudy[] =>
  getPublishedCaseStudies().slice(0, Math.min(Math.max(limit, 0), 3));

export const getPublishedCaseStudyBySlug = (slug: string): CaseStudy | null =>
  getPublishedCaseStudies().find((caseStudy) => caseStudy.slug === slug) ?? null;

export const getPublishableAssets = (caseStudy: CaseStudy): readonly CaseStudyAsset[] =>
  isCaseStudyPublishable(caseStudy)
    ? [caseStudy.clientApprovedLogoOrImage, ...caseStudy.supportingAssets].filter(
        (asset): asset is CaseStudyAsset =>
          asset !== null &&
          asset.clientApproved &&
          hasText(asset.src) &&
          hasText(asset.alt) &&
          Number.isInteger(asset.width) &&
          asset.width > 0 &&
          Number.isInteger(asset.height) &&
          asset.height > 0 &&
          hasText(asset.permissionReference) &&
          (asset.kind !== 'seller-central-screenshot' || asset.redacted),
      )
    : [];

export const getPublishableTestimonial = (
  caseStudy: CaseStudy,
): CaseStudyTestimonial | null => {
  const testimonial = caseStudy.testimonial;

  if (
    !isCaseStudyPublishable(caseStudy) ||
    testimonial === null ||
    !hasText(testimonial.quote) ||
    !hasText(testimonial.attribution) ||
    !hasText(testimonial.verificationExplanation) ||
    !hasText(testimonial.permissionReference)
  ) {
    return null;
  }

  return testimonial;
};

export const getApprovedTestimonials = (): readonly {
  id: string;
  clientLabel: string;
  testimonial: CaseStudyTestimonial;
  disclosure: string;
}[] =>
  getPublishedCaseStudies().flatMap((caseStudy) => {
    const testimonial = getPublishableTestimonial(caseStudy);

    return testimonial === null
      ? []
      : [
          {
            id: caseStudy.id,
            clientLabel: caseStudy.clientLabel,
            testimonial,
            disclosure: caseStudy.verification.disclosure,
          },
        ];
  });
