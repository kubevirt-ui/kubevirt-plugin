/** Playwright (main) TEST_PROJECT → playwright-runner-hc-e2e.sh project name. */
export const PLAYWRIGHT_PROJECT_BY_TEST_PROJECT: Record<string, string> = {
  all: 'all',
  api: 'API',
  auto: 'auto',
  gating: 'Gating',
  settings: 'Settings',
  suite: 'suite',
  tier1: 'Tier1',
  tier2: 'Tier2',
};

/** Default hot-cluster E2E suite when TEST_PROJECT is unset or blank. */
export const DEFAULT_PLAYWRIGHT_TEST_PROJECT = 'gating';

export const normalizeTestProject = (raw: string | undefined): string => {
  const trimmed = (raw ?? '').trim();
  return trimmed || DEFAULT_PLAYWRIGHT_TEST_PROJECT;
};

export const resolvePlaywrightProject = (testProject: string): string => {
  const key = normalizeTestProject(testProject).toLowerCase();
  const mapped = PLAYWRIGHT_PROJECT_BY_TEST_PROJECT[key];
  if (mapped) {
    return mapped;
  }
  throw new Error(
    `Unsupported TEST_PROJECT '${testProject}' for Playwright. ` +
      `Expected one of: ${Object.keys(PLAYWRIGHT_PROJECT_BY_TEST_PROJECT).join(', ')}`,
  );
};
