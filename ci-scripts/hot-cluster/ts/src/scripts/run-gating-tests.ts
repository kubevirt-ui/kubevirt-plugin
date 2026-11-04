/**
 * Run Playwright E2E tests for hot-cluster CI.
 *
 * **Hot-cluster CI only** (see hot-cluster-e2e-run.yml). For local development use
 * `./playwright-runner-hc-e2e.sh` from the repo root (with nvm + repo `.env`).
 *
 * Required env: BRIDGE_BASE_ADDRESS, TEST_PROJECT
 * Optional env: TEST_ARGS
 */

import { execFileSync } from 'node:child_process';

import { parseTestArgs } from './parse-test-args';
import { resolveHcPlaywrightRunner } from './resolve-hc-playwright-runner';
import {
  normalizeTestProject,
  resolvePlaywrightProject,
} from './resolve-playwright-test-project';

const main = async (): Promise<void> => {
  const rawTestProject = process.env.TEST_PROJECT;
  const testProject = normalizeTestProject(rawTestProject);
  if (!rawTestProject?.trim()) {
    console.log(
      `TEST_PROJECT unset or blank — defaulting to '${testProject}' (route-tagged @gating specs).`,
    );
  }
  const testArgs = parseTestArgs(process.env.TEST_ARGS ?? '');

  // The product repo root (where package.json and the test specs live). This
  // script is invoked from the infra overlay dir (.hc-infra/ci-scripts/...),
  // so every test command must run from here, not the script's own cwd.
  const repoRoot =
    process.env.GITHUB_WORKSPACE ??
    execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

  const playwrightProject = resolvePlaywrightProject(testProject);
  if (playwrightProject === 'auto' && testArgs.length === 0) {
    throw new Error(
      "TEST_PROJECT 'auto' requires TEST_ARGS (spec path or -g filter). " +
        'Omit auto and pick a suite to run an entire project.',
    );
  }
  console.log(
    playwrightProject === 'auto'
      ? `Running Playwright without --project filter with args: ${testArgs.join(' ')}`
      : `Running Playwright project '${playwrightProject}'` +
          (testArgs.length > 0 ? ` with args: ${testArgs.join(' ')}` : ''),
  );
  const runnerPath = resolveHcPlaywrightRunner(repoRoot);
  execFileSync(runnerPath, [playwrightProject, ...testArgs], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
