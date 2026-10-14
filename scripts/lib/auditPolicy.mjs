// Advisories reviewed and accepted for build-time tooling only. Each entry must
// have no compatible fix; remove it once the dependency can be upgraded.
// Dependencies shipped to visitors are never exempt.
export const ACCEPTED_DEV_ADVISORIES = Object.freeze({
  'GHSA-vfj7-8cjw-p6xm': {
    package: 'braces',
    reviewed: '2026-10-14',
    reason: 'No patched release exists (<=3.0.3, latest 3.0.3). Reached only through Tailwind 3 file '
      + 'watching and globbing at build time, using patterns from our own Tailwind config.',
  },
  'GHSA-rj75-hqrm-r3gf': {
    package: 'postcss-selector-parser',
    reviewed: '2026-10-14',
    reason: 'Fixed only in 7.1.6, which Tailwind 3 (latest 3.4.19, requires ^6.1.2) cannot use. '
      + 'Parses only our own CSS at build time. Clears with a Tailwind 4 migration.',
  },
});

const getAdvisories = (report) => {
  const advisories = new Map();
  for (const vulnerability of Object.values(report.vulnerabilities || {})) {
    for (const source of vulnerability.via) {
      if (typeof source !== 'object') continue;
      const id = String(source.url || '').split('/').pop() || `npm-${source.source}`;
      advisories.set(id, { id, name: source.name, severity: source.severity, title: source.title });
    }
  }
  return [...advisories.values()];
};

const isAuditReport = (report) => Number.isInteger(report?.metadata?.vulnerabilities?.total);

export const evaluateAudit = ({ all, production, accepted = ACCEPTED_DEV_ADVISORIES }) => {
  if (!isAuditReport(all) || !isAuditReport(production)) {
    return {
      failures: ['npm audit did not return a report; the registry may be unreachable.'],
      accepted: [],
      stale: [],
    };
  }

  const failures = [];
  for (const advisory of getAdvisories(production)) {
    failures.push(`${advisory.id} ${advisory.name} (${advisory.severity}) ships to visitors: ${advisory.title}`);
  }

  const reported = getAdvisories(all);
  const acceptedAdvisories = [];
  for (const advisory of reported) {
    if (accepted[advisory.id]) {
      acceptedAdvisories.push({ ...advisory, ...accepted[advisory.id] });
    } else {
      failures.push(`${advisory.id} ${advisory.name} (${advisory.severity}) is not reviewed: ${advisory.title}`);
    }
  }

  const reportedIds = new Set(reported.map(({ id }) => id));
  const stale = Object.keys(accepted).filter((id) => !reportedIds.has(id));

  return { failures, accepted: acceptedAdvisories, stale };
};
