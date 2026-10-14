import { spawnSync } from 'node:child_process';
import { evaluateAudit } from '../lib/auditPolicy.mjs';

const runAudit = (...flags) => {
  const result = spawnSync('npm', ['audit', '--json', ...flags], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
};

const { failures, accepted, stale } = evaluateAudit({
  all: runAudit(),
  production: runAudit('--omit=dev'),
});

for (const advisory of accepted) {
  console.warn(`Accepted build-tool advisory ${advisory.id} (${advisory.package}, reviewed ${advisory.reviewed}): ${advisory.reason}`);
}
for (const id of stale) {
  console.warn(`${id} is no longer reported; remove it from scripts/lib/auditPolicy.mjs.`);
}

if (failures.length > 0) {
  console.error(`Security audit failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Security audit passed: no vulnerabilities in shipped dependencies; ${accepted.length} reviewed build-tool advisories accepted.`);
