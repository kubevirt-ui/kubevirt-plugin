import './playwright/load-env';

import * as path from 'path';

import type { ReporterDescription } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

import { EnvVariables } from './playwright/src/utils/env-variables';
import { getTestResultsDir } from './playwright/src/utils/test-results-dir';
import { TestTimeouts } from './playwright/src/utils/test-config';
import { getStorageStateDir, getStorageStatePath } from './playwright/src/utils/storage-state';

const repoRoot = path.resolve(__dirname);
const testResultsDir = getTestResultsDir(repoRoot);

function getReporterConfig(resultsDir: string): ReporterDescription[] {
  const allureReporter: ReporterDescription = [
    path.resolve(__dirname, 'playwright/src/utils/allure-no-stdout-reporter.ts'),
    { detail: true, resultsDir, suiteTitle: true },
  ];

  if (EnvVariables.isDebugMode) {
    return [['list']];
  }

  if (EnvVariables.isSharded) {
    const junitFile = path.resolve(
      repoRoot,
      'junit-results',
      `junit-shard-${EnvVariables.shardIndex}.xml`,
    );
    return [allureReporter, ['junit', { outputFile: junitFile }]];
  }

  const junitFile = path.resolve(repoRoot, 'junit-results', 'junit.xml');
  return [['list'], allureReporter, ['junit', { outputFile: junitFile }]];
}

const baseURL = EnvVariables.webConsoleUrl;
/** Written by global.setup; every test context loads this (main-style). */
const storageState = getStorageStatePath();
const nonPrivStorageState = `${getStorageStateDir()}/nonpriv-state.json`;

/** Chrome flags aligned with kubevirt-ui `main` `playwright.config.ts`. */
const chromeArgs = [
  '--ignore-certificate-errors',
  '--start-maximized',
  '--window-size=1920,1080',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-popup-blocking',
  '--disable-sync',
  '--disable-translate',
  '--no-first-run',
  '--js-flags=--max-old-space-size=4096',
  ...(process.env.DIAGNOSE_FAILURES === '1' ? ['--remote-debugging-port=0'] : []),
];

const migrationUse = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: chromeArgs,
    headless: !process.env.DEBUG_MODE && !process.env.HEADED,
  },
  viewport: { height: 1080, width: 1920 },
};

/** Route-based UI specs under `playwright/tests/` (main layout). */
const uiTestDir = './playwright/tests';
const uiTestIgnoreApi = '**/api/**';

export default defineConfig({
  expect: { timeout: TestTimeouts.ELEMENT_WAIT },
  forbidOnly: EnvVariables.isCI,
  fullyParallel: true,
  globalSetup: './playwright/project-dependencies/global.setup.ts',
  globalTeardown: './playwright/project-dependencies/global.teardown.ts',
  outputDir: testResultsDir,
  /** Resolve `@/` → `playwright/src/` (see playwright/tsconfig.json). */
  tsconfig: './playwright/tsconfig.json',
  projects: [
    {
      fullyParallel: true,
      grep: /@gating/,
      name: 'Gating',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: { ...migrationUse, storageState, baseURL },
    },
    {
      fullyParallel: true,
      grep: /@tier1/,
      name: 'Tier1',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: { ...migrationUse, storageState, baseURL },
    },
    {
      fullyParallel: true,
      grep: /@tier2/,
      name: 'Tier2',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: { ...migrationUse, storageState, baseURL },
    },
    {
      fullyParallel: true,
      grep: /@tier1/,
      grepInvert: /@admin-only/,
      name: 'Tier1NonPriv',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: { ...migrationUse, baseURL, storageState: nonPrivStorageState },
    },
    {
      fullyParallel: true,
      grep: /@tier2/,
      grepInvert: /@admin-only/,
      name: 'Tier2NonPriv',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: { ...migrationUse, baseURL, storageState: nonPrivStorageState },
    },
  ],
  reporter: getReporterConfig(testResultsDir),
  retries: EnvVariables.retries,
  timeout: TestTimeouts.TEST_LONG,
  use: {
    actionTimeout: TestTimeouts.ELEMENT_WAIT,
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    storageState,
    testIdAttribute: 'data-test',
    trace: 'off',
    video: 'off',
    viewport: { height: 1080, width: 1920 },
  },
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4,
});
