import { defineConfig, devices } from '@playwright/test';

const baseAddress = process.env.BRIDGE_BASE_ADDRESS ?? 'http://localhost:9000';
const basePath = process.env.BRIDGE_BASE_PATH ?? '/';
export const baseURL = `${baseAddress}${basePath}`.replace(/\/$/, '');

export default defineConfig({
  expect: { timeout: 60_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  outputDir: './playwright/test-results/artifacts',
  /**
   * Projects run in dependency order:
   *  1. setup  — creates the example VM and SSH secret (must succeed before gating)
   *  2. gating — all gating specs, depend on setup completing successfully
   */
  projects: [
    {
      name: 'setup',
      testDir: './playwright/tests/setup',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      dependencies: ['setup'],
      name: 'gating',
      testDir: './playwright/tests/gating',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [
    ['list'],
    ['junit', { outputFile: './playwright/test-results/results.xml' }],
    ['html', { open: 'never', outputFolder: './playwright/test-results/html-report' }],
  ],
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  use: {
    actionTimeout: 60_000,
    baseURL,
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    viewport: { height: 1200, width: 1920 },
  },

  workers: 1,
});
