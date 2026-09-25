import { HERO_HEADLINE } from '../content/hero.js';

export const CRO_EXPERIMENT_IDS = Object.freeze({
  heroPositioning: 'hero_positioning',
  primaryCtaCopy: 'primary_cta_copy',
  formPresentation: 'form_presentation',
  aboveFoldProof: 'above_fold_proof',
  revenueRangeField: 'revenue_range_field',
});

export const CRO_VARIANTS = Object.freeze({
  control: 'control',
  treatment: 'treatment',
});

const experiment = ({ id, status = 'ready', blockedReason = null, control, treatment }) =>
  Object.freeze({
    id,
    status,
    blockedReason,
    variants: Object.freeze({
      [CRO_VARIANTS.control]: Object.freeze(control),
      [CRO_VARIANTS.treatment]: Object.freeze(treatment),
    }),
  });

export const CRO_EXPERIMENTS = Object.freeze({
  [CRO_EXPERIMENT_IDS.heroPositioning]: experiment({
    id: CRO_EXPERIMENT_IDS.heroPositioning,
    control: {
      headline: HERO_HEADLINE,
      positioning: 'problem-focused',
    },
    treatment: {
      headline: 'Build Profitable Amazon Growth Across India and Global Marketplaces',
      positioning: 'outcome-focused',
    },
  }),
  [CRO_EXPERIMENT_IDS.primaryCtaCopy]: experiment({
    id: CRO_EXPERIMENT_IDS.primaryCtaCopy,
    control: { label: 'Request My Free Amazon Audit' },
    treatment: { label: 'Get My Amazon Growth Plan' },
  }),
  [CRO_EXPERIMENT_IDS.formPresentation]: experiment({
    id: CRO_EXPERIMENT_IDS.formPresentation,
    control: { presentation: 'embedded' },
    treatment: { presentation: 'cta-triggered' },
  }),
  [CRO_EXPERIMENT_IDS.aboveFoldProof]: experiment({
    id: CRO_EXPERIMENT_IDS.aboveFoldProof,
    status: 'blocked',
    blockedReason:
      'No case study currently meets the repository publication and evidence standard.',
    control: { proofType: 'amazon-partner' },
    treatment: { proofType: 'verified-case-study' },
  }),
  [CRO_EXPERIMENT_IDS.revenueRangeField]: experiment({
    id: CRO_EXPERIMENT_IDS.revenueRangeField,
    control: { collectMonthlyRevenue: true },
    treatment: { collectMonthlyRevenue: false },
  }),
});

export const getCroExperiment = (experimentId) => CRO_EXPERIMENTS[experimentId] ?? null;
