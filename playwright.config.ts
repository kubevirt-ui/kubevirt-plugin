import * as path from 'path';

import type { ReporterDescription } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

import './playwright/load-env';

import { EnvVariables } from './playwright/src/utils/env-variables';
import {
  getStorageStatePathForConfig,
  storageStateExists,
} from './playwright/src/utils/storage-state';
import { TestTimeouts } from './playwright/src/utils/test-config';
import { getTestResultsDir } from './playwright/src/utils/test-results-dir';

const repoRoot = path.resolve(__dirname);
const testResultsDir = getTestResultsDir(repoRoot);

function getReporterConfig(resultsDir: string): ReporterDescription[] {
  const ciDebugHarness: ReporterDescription = [
    path.resolve(__dirname, 'playwright/src/utils/ci-debug-harness.ts'),
  ];

  // USE_ALLURE=0 → skip Allure; videos/screenshots still land in outputDir (test-results/).
  const allureReporter: ReporterDescription[] = EnvVariables.useAllure
    ? [
        [
          path.resolve(__dirname, 'playwright/src/utils/allure-no-stdout-reporter.ts'),
          { detail: true, resultsDir, suiteTitle: true },
        ],
      ]
    : [];

  if (EnvVariables.isDebugMode) {
    return [ciDebugHarness, ['list']];
  }

  if (EnvVariables.isSharded) {
    const junitFile = path.resolve(
      repoRoot,
      'junit-results',
      `junit-shard-${EnvVariables.shardIndex}.xml`,
    );
    return [ciDebugHarness, ...allureReporter, ['junit', { outputFile: junitFile }]];
  }

  const junitFile = path.resolve(repoRoot, 'junit-results', 'junit.xml');
  return [ciDebugHarness, ['list'], ...allureReporter, ['junit', { outputFile: junitFile }]];
}

const baseURL = EnvVariables.webConsoleUrl;
/**
 * Written by global.setup. Only pass a path when the file exists — Playwright throws
 * ENOENT if `storageState` points at a missing file (e.g. after teardown between runs).
 */
const storageStatePath = getStorageStatePathForConfig();
const storageState = storageStateExists() ? storageStatePath : undefined;

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
];

const chromeUse = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: chromeArgs,
    headless: !process.env.DEBUG_MODE && !process.env.HEADED,
  },
  viewport: { height: 1080, width: 1920 },
};

/** Route-based UI specs under `playwright/tests/`. */
const uiTestDir = './playwright/tests';
const uiTestIgnoreManual = ['**/api/**', '**/explore/**'];

/** Exact tag match — avoid `/@gating/` also matching secondary tags. */
const tagExact = (tag: string): RegExp =>
  new RegExp(`${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);

export default defineConfig({
  expect: { timeout: TestTimeouts.ELEMENT_WAIT },
  forbidOnly: EnvVariables.isCI,
  fullyParallel: true,
  globalSetup: './playwright/project-dependencies/global.setup.ts',
  globalTeardown: './playwright/project-dependencies/global.teardown.ts',
  outputDir: testResultsDir,
  projects: [
    {
      fullyParallel: EnvVariables.isCI ? false : true,
      grep: tagExact('@gating'),
      name: 'Gating',
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreManual,
      use: { ...chromeUse, baseURL, storageState },
    },
  ],
  reporter: getReporterConfig(testResultsDir),
  retries: EnvVariables.retries,
  timeout: TestTimeouts.TEST_LONG,
  tsconfig: './playwright/tsconfig.json',
  use: {
    actionTimeout: TestTimeouts.ELEMENT_WAIT,
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    navigationTimeout: TestTimeouts.NAVIGATION,
    screenshot: 'only-on-failure',
    storageState,
    testIdAttribute: 'data-test',
    trace: 'off',
    video: 'retain-on-failure',
    viewport: { height: 1080, width: 1920 },
  },
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4,
});
