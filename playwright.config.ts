import * as path from 'path';

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { env } from './playwright/utils/env';

export const baseURL = env.baseURL;

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

export default defineConfig({
  expect: { timeout: 60_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup:
    process.env.USE_SCENARIO_INFRA === 'true'
      ? './playwright/project-dependencies/global.setup.ts'
      : undefined,
  globalTeardown:
    process.env.USE_SCENARIO_INFRA === 'true'
      ? './playwright/project-dependencies/global.teardown.ts'
      : undefined,
  outputDir: './playwright/test-results/artifacts',
  /**
   * Projects run in dependency order:
   *  1. setup  — logs in and saves auth state (single worker, must succeed before gating)
   *  2. gating — all gating specs run in parallel after setup completes
   */
  projects: [
    {
      fullyParallel: false,
      name: 'setup',
      testDir: './playwright/tests/setup',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: chromeArgs,
          headless: !process.env.DEBUG_MODE && !process.env.HEADED,
        },
        viewport: { height: 1080, width: 1920 },
      },
    },
    {
      dependencies: ['setup'],
      fullyParallel: false,
      name: 'gating',
      testDir: './playwright/tests/gating',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: chromeArgs,
          headless: !process.env.DEBUG_MODE && !process.env.HEADED,
        },
        storageState: 'playwright/.auth/session.json',
        viewport: { height: 1080, width: 1920 },
      },
    },
    ...(process.env.RUN_FEATURE_TESTS === 'true'
      ? [
          {
            dependencies: ['setup'],
            fullyParallel: false,
            name: 'features',
            retries: 2,
            testDir: './playwright/tests/features',
            use: {
              ...devices['Desktop Chrome'],
              launchOptions: {
                args: chromeArgs,
                headless: !process.env.DEBUG_MODE && !process.env.HEADED,
              },
              storageState: 'playwright/.auth/session.json',
              viewport: { height: 1080, width: 1920 },
            },
          },
        ]
      : []),
    ...(process.env.USE_SCENARIO_INFRA === 'true'
      ? [
          {
            fullyParallel: false,
            name: 'scenario',
            testDir: './playwright/tests/scenario',
            use: {
              ...devices['Desktop Chrome'],
              launchOptions: {
                args: chromeArgs,
                headless: !process.env.DEBUG_MODE && !process.env.HEADED,
              },
              viewport: { height: 1080, width: 1920 },
            },
          },
        ]
      : []),
  ],
  reporter: [
    ['list'],
    ['junit', { outputFile: './playwright/test-results/results.xml' }],
    ['html', { open: 'never', outputFolder: './playwright/test-results/html-report' }],
  ],
  retries: process.env.CI ? 1 : 0,
  timeout: 480 * 1000,
  use: {
    actionTimeout: 60_000,
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    viewport: { height: 1080, width: 1920 },
  },
  /**
   * Number of parallel workers. Setup runs a single file so it naturally uses one
   * worker regardless of this value. Gating spec files run across all workers.
   * Override with the WORKERS env var (e.g. WORKERS=2 for resource-constrained envs).
   */
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4,
});
