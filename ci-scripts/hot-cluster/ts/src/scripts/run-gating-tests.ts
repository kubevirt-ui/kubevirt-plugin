/**
 * Run E2E tests: dispatches to the correct test engine (Cypress or Playwright).
 *
 * **Hot-cluster CI only** (see hot-cluster-e2e-run.yml). For local development use
 * `./playwright-runner-hc-e2e.sh` from the repo root (with nvm + repo `.env`).
 *
 * Required env: TEST_ENGINE, BRIDGE_BASE_ADDRESS, TEST_PROJECT
 * Optional env: TEST_ARGS
 * Cypress-specific env: TEST_NS, OS_IMAGES_NS, CNV_NS, TEST_SECRET_NAME
 */

import { execFileSync, execSync } from 'node:child_process';

import { requireEnv } from '../utils';

import { parseTestArgs } from './parse-test-args';
import {
  normalizeTestProject,
  resolvePlaywrightProject,
} from './resolve-playwright-test-project';

/** Cypress (release) TEST_PROJECT → spec file. `features` is Cypress's Tier1 suite. */
const CYPRESS_TEST_PROJECTS: Record<string, string> = {
  features: 'tests/tier1.cy.ts',
  gating: 'tests/gating.cy.ts',
};

const resolveCypressSpec = (testProject: string): string => {
  const key = testProject.toLowerCase();
  const spec = CYPRESS_TEST_PROJECTS[key];
  if (spec) {
    return spec;
  }
  throw new Error(
    `Unsupported TEST_PROJECT '${testProject}' for Cypress. ` +
      `Expected one of: ${Object.keys(CYPRESS_TEST_PROJECTS).join(', ')}`,
  );
};

const main = async (): Promise<void> => {
  const testEngine = requireEnv('TEST_ENGINE');
  const rawTestProject = process.env.TEST_PROJECT;
  const testProject = normalizeTestProject(rawTestProject);
  if (!rawTestProject?.trim()) {
    console.log(
      `TEST_PROJECT unset or blank — defaulting to '${testProject}' (route-tagged @gating specs).`,
    );
  }
  const testArgs = parseTestArgs(process.env.TEST_ARGS ?? '');

  if (testEngine === 'cypress') {
    const testNs = requireEnv('TEST_NS');
    const osImagesNs = requireEnv('OS_IMAGES_NS');
    const cnvNs = requireEnv('CNV_NS');
    const testSecretName = requireEnv('TEST_SECRET_NAME');

    const env = {
      ...process.env,
      CYPRESS_CNV_NS: cnvNs,
      CYPRESS_OS_IMAGES_NS: osImagesNs,
      CYPRESS_TEST_NS: testNs,
      CYPRESS_TEST_SECRET_NAME: testSecretName,
    };

    execSync(`oc project "${testNs}"`, { env, stdio: 'inherit' });

    const spec = resolveCypressSpec(testProject);
    execSync(`npm run test-cypress-headless -- --spec ${spec}`, { env, stdio: 'inherit' });
  } else {
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
    execFileSync('./playwright-runner-hc-e2e.sh', [playwrightProject, ...testArgs], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
