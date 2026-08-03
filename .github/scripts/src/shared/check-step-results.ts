/**
 * Aggregate step outcomes and fail if any failed or were skipped.
 * Entry point: npx tsx src/shared/check-step-results.ts
 *
 * Env: STEP_RESULTS — JSON object mapping step names to outcomes
 *      e.g. {"i18n":"success","lint":"failure","build":"success"}
 *
 * Skipped checks count as failures so a missing setup step cannot hide
 * behind an empty "All checks passed" summary.
 */

import { requireEnv } from '../utils';

import { failStep } from './output';

const main = (): void => {
  const raw = requireEnv('STEP_RESULTS');
  const results = JSON.parse(raw) as Record<string, string>;

  const failed: string[] = [];
  const skipped: string[] = [];
  const names = Object.keys(results);
  for (const name of names) {
    const outcome = results[name];
    if (outcome === 'failure') {
      failed.push(name);
    } else if (outcome === 'skipped' || outcome === '') {
      skipped.push(name);
    }
  }

  const problems: string[] = [];
  if (failed.length > 0) {
    problems.push(`Failed checks: ${failed.join(', ')}`);
  }
  if (skipped.length > 0) {
    problems.push(`Skipped checks: ${skipped.join(', ')}`);
  }
  if (problems.length > 0) {
    failStep(problems.join('; '));
  }

  console.log('All checks passed');
};

main();
