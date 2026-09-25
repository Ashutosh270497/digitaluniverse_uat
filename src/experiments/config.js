const environment = import.meta.env ?? {};

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const asBoolean = (value) => asTrimmedString(value).toLowerCase() === 'true';

const asTreatmentPercentage = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 99 ? parsed : 50;
};

const asHostnameList = (value) => Object.freeze(
  (asTrimmedString(value) || 'localhost,127.0.0.1')
    .split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean),
);

const testMode = environment.MODE === 'test'
  || globalThis.process?.env?.NODE_ENV === 'test'
  || Boolean(globalThis.process?.env?.NODE_TEST_CONTEXT);
const previewVariantCandidate = asTrimmedString(environment.VITE_CRO_PREVIEW_VARIANT);

export const CRO_CONFIG = Object.freeze({
  approved: asBoolean(environment.VITE_CRO_APPROVED),
  activeExperimentId: asTrimmedString(environment.VITE_CRO_ACTIVE_EXPERIMENT_ID) || null,
  treatmentPercentage: asTreatmentPercentage(environment.VITE_CRO_TREATMENT_PERCENT),
  excludedHostnames: asHostnameList(environment.VITE_CRO_EXCLUDED_HOSTNAMES),
  excludeAutomation: !asBoolean(environment.VITE_CRO_INCLUDE_AUTOMATION),
  internalQueryParameter: 'cro_internal',
  assignmentStorageKey: 'dup_cro_assignments_v1',
  exclusionStorageKey: 'dup_cro_excluded_v1',
  testMode,
  previewVariant: (environment.DEV || testMode)
    && ['control', 'treatment'].includes(previewVariantCandidate)
    ? previewVariantCandidate
    : null,
});
