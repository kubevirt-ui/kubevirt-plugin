/**
 * Run E2E tests: dispatches to the correct test engine (Cypress or Playwright).
 *
 * Playwright (main): maps TEST_PROJECT to a playwright-runner-hc-e2e.sh project
 * (gating, tier1, tier2, suite, …) and forwards TEST_ARGS as extra CLI args
 * (file paths, -g patterns, --workers, …).
 *
 * Cypress (release branches): runs tests/gating.cy.ts, or tests/tier1.cy.ts when
 * TEST_PROJECT=features (or tier1).
 *
 * Required env: TEST_ENGINE, BRIDGE_BASE_ADDRESS, TEST_PROJECT
 * Optional env: TEST_ARGS
 * Cypress-specific env: TEST_NS, OS_IMAGES_NS, CNV_NS, TEST_SECRET_NAME
 */

import { execFileSync, execSync } from 'node:child_process';

import { requireEnv } from '../utils';

const PLAYWRIGHT_PROJECT_BY_TEST_PROJECT: Record<string, string> = {
  all: 'all',
  api: 'API',
  features: 'Tier1',
  gating: 'Gating',
  settings: 'Settings',
  suite: 'suite',
  tier1: 'Tier1',
  tier2: 'Tier2',
};

/** Split TEST_ARGS on whitespace for safe argv forwarding (no shell). */
const parseTestArgs = (raw: string): string[] => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed.split(/\s+/);
};

const resolvePlaywrightProject = (testProject: string): string => {
  const key = testProject.toLowerCase();
  const mapped = PLAYWRIGHT_PROJECT_BY_TEST_PROJECT[key];
  if (mapped) {
    return mapped;
  }
  throw new Error(
    `Unsupported TEST_PROJECT '${testProject}' for Playwright. ` +
      `Expected one of: ${Object.keys(PLAYWRIGHT_PROJECT_BY_TEST_PROJECT).join(', ')}`,
  );
};

const main = async (): Promise<void> => {
  const testEngine = requireEnv('TEST_ENGINE');
  const testProject = requireEnv('TEST_PROJECT');
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

    const projectLower = testProject.toLowerCase();
    const spec =
      projectLower === 'features' || projectLower === 'tier1'
        ? 'tests/tier1.cy.ts'
        : 'tests/gating.cy.ts';
    execSync(`npm run test-cypress-headless -- --spec ${spec}`, { env, stdio: 'inherit' });
  } else {
    const repoRoot =
      process.env.GITHUB_WORKSPACE ??
      execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    const playwrightProject = resolvePlaywrightProject(testProject);
    console.log(
      `Running Playwright project '${playwrightProject}'` +
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
