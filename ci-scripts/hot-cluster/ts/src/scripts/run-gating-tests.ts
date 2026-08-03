/**
 * Run gating tests: dispatches to the correct test engine (Cypress or Playwright).
 *
 * Playwright (main): runs Gating + Tier1 via playwright-runner-hc-e2e.sh Gating.
 * Cypress (release branches): runs tests/gating.cy.ts, or tests/tier1.cy.ts when
 * TEST_PROJECT=features.
 *
 * Required env: TEST_ENGINE, BRIDGE_BASE_ADDRESS, TEST_PROJECT
 * Cypress-specific env: TEST_NS, OS_IMAGES_NS, CNV_NS, TEST_SECRET_NAME
 */

import { execFileSync, execSync } from 'node:child_process';

import { requireEnv } from '../utils';

const main = async (): Promise<void> => {
  const testEngine = requireEnv('TEST_ENGINE');
  const testProject = requireEnv('TEST_PROJECT');

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

    const spec = testProject === 'features' ? 'tests/tier1.cy.ts' : 'tests/gating.cy.ts';
    execSync(`npm run test-cypress-headless -- --spec ${spec}`, { env, stdio: 'inherit' });
  } else {
    const repoRoot =
      process.env.GITHUB_WORKSPACE ??
      execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    execSync('./playwright-runner-hc-e2e.sh Gating', { cwd: repoRoot, stdio: 'inherit' });
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
