/**
 * Aggregate step outcomes and fail if any failed.
 * Entry point: npx tsx src/shared/check-step-results.ts
 *
 * Env: STEP_RESULTS — JSON object mapping step names to outcomes
 *      e.g. {"i18n":"success","lint":"failure","build":"success"}
 */

import { requireEnv } from '../utils';
import { failStep } from './output';

const main = (): void => {
  const raw = requireEnv('STEP_RESULTS');
  const results = JSON.parse(raw) as Record<string, string>;

  const failed: string[] = [];
  const names = Object.keys(results);
  for (const name of names) {
    if (results[name] === 'failure') {
      failed.push(name);
    }
  }

  if (failed.length > 0) {
    failStep(`Failed checks: ${failed.join(', ')}`);
  }

  console.log('All checks passed');
};

main();
