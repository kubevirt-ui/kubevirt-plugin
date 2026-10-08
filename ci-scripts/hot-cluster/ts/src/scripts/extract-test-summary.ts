/**
 * Extract a spec-grouped pass/fail markdown summary from Playwright JUnit
 * XML results. Outputs `test_summary` to GITHUB_OUTPUT (always, including
 * all-pass runs) and also appends it to the job's step summary.
 *
 * Required env: TEST_ENGINE
 * Optional env: BRIDGE_BASE_ADDRESS, CHECKOUT_REF, CLUSTER_NAME, CNV_CHANNEL,
 *               CNV_PIN_VERSION, CONSOLE_ROUTE, GITHUB_* , INFRASTRUCTURE_TYPE,
 *               OPENSHIFT_VERSION, PLUGIN_IMAGE, PR_NUMBER, RUNNER_LABEL, TEST_ARGS,
 *               TEST_NS, TEST_PROJECT (GITHUB_WORKSPACE falls back to
 *               `git rev-parse --show-toplevel`, matching run-gating-tests.ts)
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { addStepSummary, setMultilineOutput, setOutput } from '../utils';

import { formatTestSummary, parseJUnitSummary } from './format-test-summary';
import { resolveTestRunEnvironment } from './resolve-test-run-environment';

const RESULTS_FILE_RELATIVE_PATH = 'playwright/test-results/results.xml';

/** Resolve results.xml from the repo root, not the script's cwd (ci-scripts/hot-cluster/ts). */
const resolveResultsFile = (): string => {
  const repoRoot =
    process.env.GITHUB_WORKSPACE ??
    execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  return join(repoRoot, RESULTS_FILE_RELATIVE_PATH);
};

const main = async (): Promise<void> => {
  const testEngine = process.env.TEST_ENGINE ?? '';
  const resultsFile = resolveResultsFile();

  if (testEngine !== 'playwright' || !existsSync(resultsFile)) {
    setOutput('test_summary', '');
    return;
  }

  const xml = readFileSync(resultsFile, 'utf8');
  const summary = parseJUnitSummary(xml);
  const markdown = formatTestSummary(summary, await resolveTestRunEnvironment());

  setMultilineOutput('test_summary', markdown);
  if (markdown) {
    addStepSummary(markdown);
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
