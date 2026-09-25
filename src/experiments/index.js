import { CRO_CONFIG } from './config.js';
import { CRO_EXPERIMENT_IDS, CRO_EXPERIMENTS, CRO_VARIANTS } from './catalog.js';
import { createExperimentRuntime } from './runtime.js';

export { CRO_CONFIG } from './config.js';
export { CRO_EXPERIMENT_IDS, CRO_EXPERIMENTS, CRO_VARIANTS } from './catalog.js';
export { createExperimentRuntime } from './runtime.js';

export const croExperiments = createExperimentRuntime({ config: CRO_CONFIG });

export const initializeCroExperiments = () => croExperiments.initialize();

export const getCroValue = (experimentId, key, fallback) =>
  croExperiments.getValue(experimentId, key, fallback);

export const getCroAnalyticsContext = () => croExperiments.getAnalyticsContext();

export const getCroLeadContext = () => croExperiments.getLeadContext();

export const CRO_DEFAULTS = Object.freeze({
  heroHeadline:
    CRO_EXPERIMENTS[CRO_EXPERIMENT_IDS.heroPositioning].variants[CRO_VARIANTS.control].headline,
  primaryCtaLabel:
    CRO_EXPERIMENTS[CRO_EXPERIMENT_IDS.primaryCtaCopy].variants[CRO_VARIANTS.control].label,
});
