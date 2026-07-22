import * as path from 'path';

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export const baseURL = (() => {
  const addr =
    process.env.WEB_CONSOLE_URL || process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000';
  const basePath = process.env.BRIDGE_BASE_PATH ?? '/';
  return `${addr}${basePath}`.replace(/\/$/, '');
})();

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

export default defineConfig({
  expect: { timeout: 60_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: './playwright/project-dependencies/global.setup.ts',
  globalTeardown: './playwright/project-dependencies/global.teardown.ts',
  outputDir: './playwright/test-results/artifacts',
  projects: [
    // ── Gating project (scenario infrastructure) ─────────────────────
    {
      fullyParallel: true,
      name: 'Gating',
      retries: 0,
      testDir: './playwright/tests/gating',
      use: migrationUse,
    },

    // ── Tier1 project (scenario infrastructure) ────────────────────
    {
      fullyParallel: false,
      name: 'Tier1',
      retries: 0,
      testDir: './playwright/tests/tier1',
      use: migrationUse,
    },

    // ── Tier2 project (scenario infrastructure) ────────────────────
    {
      fullyParallel: false,
      name: 'Tier2',
      retries: 0,
      testDir: './playwright/tests/tier2',
      use: migrationUse,
    },

    // ── Settings project (scenario infrastructure) ────────────────────
    {
      fullyParallel: false,
      name: 'Settings',
      retries: 0,
      testDir: './playwright/tests/settings',
      use: migrationUse,
    },

    // ── API contract tests (browserless, console proxy) ────────────────
    {
      fullyParallel: false,
      name: 'API',
      retries: 0,
      testDir: './playwright/tests/api',
      use: migrationUse,
    },

    // ── Migration projects (use global setup/teardown) ───────────────
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
    testIdAttribute: 'data-test',
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    viewport: { height: 1080, width: 1920 },
  },
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : 4,
});
