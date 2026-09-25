import { CRO_VARIANTS, getCroExperiment } from './catalog.js';

const safeStorageRead = (storage, key) => {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
};

const safeStorageWrite = (storage, key, value) => {
  try {
    storage?.setItem?.(key, value);
    return true;
  } catch {
    return false;
  }
};

const readJsonObject = (storage, key) => {
  try {
    const value = JSON.parse(safeStorageRead(storage, key) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

const hashToBucket = (value) => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 100;
};

const defaultSeedFactory = (windowObject) => {
  const uuid = windowObject?.crypto?.randomUUID?.();
  if (uuid) return uuid;

  const values = new Uint32Array(4);
  windowObject?.crypto?.getRandomValues?.(values);
  if (values.some(Boolean)) return [...values].join('-');

  return `fallback-${Date.now()}-${Math.random()}`;
};

const getInternalQueryExclusion = (windowObject, parameter) => {
  try {
    const value = new URLSearchParams(windowObject?.location?.search ?? '').get(parameter);
    return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
  } catch {
    return false;
  }
};

const assignmentIsValid = (assignment, experiment) =>
  assignment?.experimentId === experiment.id
  && Object.hasOwn(experiment.variants, assignment.variant);

export const createExperimentRuntime = ({
  config,
  windowObject = globalThis.window,
  sessionStorageObject = windowObject?.sessionStorage,
  seedFactory = defaultSeedFactory,
} = {}) => {
  let inMemoryAssignment = null;
  let initialized = false;
  let excluded = false;
  let exclusionReason = null;

  const experiment = getCroExperiment(config?.activeExperimentId);
  const canRun = Boolean(config?.approved && experiment?.status === 'ready');

  const detectExclusion = () => {
    if (safeStorageRead(sessionStorageObject, config.exclusionStorageKey) === 'true') {
      return 'stored_internal_or_test_traffic';
    }
    if (config.testMode) return 'automated_test_mode';
    if (config.excludeAutomation && windowObject?.navigator?.webdriver) return 'browser_automation';

    const hostname = String(windowObject?.location?.hostname ?? '').toLowerCase();
    if (config.excludedHostnames.includes(hostname)) return 'excluded_hostname';
    if (getInternalQueryExclusion(windowObject, config.internalQueryParameter)) {
      return 'internal_query_parameter';
    }
    return null;
  };

  const initialize = () => {
    if (initialized) return false;
    initialized = true;
    exclusionReason = detectExclusion();
    excluded = Boolean(exclusionReason);
    if (excluded) safeStorageWrite(sessionStorageObject, config.exclusionStorageKey, 'true');
    return true;
  };

  const getStoredAssignment = () => {
    const assignments = readJsonObject(sessionStorageObject, config.assignmentStorageKey);
    const assignment = assignments[experiment.id];
    return assignmentIsValid(assignment, experiment) ? assignment : null;
  };

  const createAssignment = () => {
    const seed = seedFactory(windowObject);
    const variant = hashToBucket(`${experiment.id}:${seed}`) < config.treatmentPercentage
      ? CRO_VARIANTS.treatment
      : CRO_VARIANTS.control;
    const assignment = Object.freeze({ experimentId: experiment.id, variant });
    const assignments = readJsonObject(sessionStorageObject, config.assignmentStorageKey);
    safeStorageWrite(
      sessionStorageObject,
      config.assignmentStorageKey,
      JSON.stringify({ ...assignments, [experiment.id]: assignment }),
    );
    return assignment;
  };

  const getAssignment = () => {
    initialize();
    if (!experiment) return null;

    if (config.previewVariant) {
      return Object.freeze({
        experimentId: experiment.id,
        variant: config.previewVariant,
        preview: true,
      });
    }
    if (!canRun || excluded) return null;
    if (inMemoryAssignment) return inMemoryAssignment;

    inMemoryAssignment = getStoredAssignment() ?? createAssignment();
    return inMemoryAssignment;
  };

  const getValue = (experimentId, key, fallback) => {
    const definition = getCroExperiment(experimentId);
    if (!definition) return fallback;

    const assignment = experimentId === experiment?.id ? getAssignment() : null;
    const variant = assignment?.variant ?? CRO_VARIANTS.control;
    return definition.variants[variant]?.[key] ?? fallback;
  };

  const getAnalyticsContext = () => {
    const assignment = getAssignment();
    if (!assignment || assignment.preview || excluded) return {};
    return {
      experiment_id: assignment.experimentId,
      experiment_variant: assignment.variant,
    };
  };

  const getLeadContext = () => {
    const assignment = getAssignment();
    return assignment
      ? { experimentId: assignment.experimentId, experimentVariant: assignment.variant }
      : {};
  };

  return Object.freeze({
    initialize,
    getAssignment,
    getValue,
    getAnalyticsContext,
    getLeadContext,
    isExcluded: () => excluded,
    getExclusionReason: () => exclusionReason,
  });
};
