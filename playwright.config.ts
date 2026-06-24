import * as path from 'path';

import type { ReporterDescription } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

import 'dotenv/config';

import { EnvVariables } from './playwright/src/utils/env-variables';
import { getStorageStatePath } from './playwright/src/utils/storage-state';

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

function getReporterConfig(): ReporterDescription[] {
  if (process.env.VERBOSE_REPORTER) return [['list', { printSteps: true }]];
  return [['list']];
}

const sharedBrowserUse = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: chromeArgs,
    headless: !EnvVariables.isDebugMode && !process.env.HEADED,
  },
  viewport: { height: 1080, width: 1920 } as const,
};

const testsDir = './playwright/tests';
const storageState = getStorageStatePath(path.resolve(__dirname, 'playwright'), true) as string;

export default defineConfig({
  expect: {
    timeout: EnvVariables.isNonPrivUser ? 45_000 : 30_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: path.resolve(__dirname, 'playwright', 'project-dependencies', 'global.setup.ts'),
  globalTeardown: path.resolve(
    __dirname,
    'playwright',
    'project-dependencies',
    'global.teardown.ts',
  ),
  outputDir: process.env.ARTIFACT_DIR
    ? `${process.env.ARTIFACT_DIR}/playwright-artifacts`
    : './playwright/test-results/artifacts',

  projects: [
    {
      fullyParallel: true,
      name: 'Gating',
      testDir: testsDir,
      testMatch: '**/tests/gating/**/*.spec.ts',
      use: { ...sharedBrowserUse, storageState },
    },
  ],

  reporter: getReporterConfig(),
  retries: 0,
  timeout: 480_000,
  use: {
    actionTimeout: 60_000,
    baseURL: EnvVariables.webConsoleUrl,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    viewport: { height: 1080, width: 1920 },
  },
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4,
});
