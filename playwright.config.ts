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

/** Route-based UI specs; API specs live under `playwright/tests/api`. */
const uiTestDir = './playwright/tests';
const uiTestIgnoreApi = '**/api/**';
/** Avoid running `@cnv-settings` specs twice (Gating + Settings). */
const uiGrepInvertSettings = /@cnv-settings/;

const galleryOrigin = 'http://localhost:3100';
const galleryURL = `${galleryOrigin}/playwright/gallery/`;

/** Start the Rspack story gallery only when component tests are part of this run. */
const shouldStartGalleryWebServer = (): boolean => {
  const argv = process.argv;
  const selectedProjects: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--project' && argv[i + 1]) {
      selectedProjects.push(argv[i + 1]);
    } else if (arg?.startsWith('--project=')) {
      selectedProjects.push(arg.slice('--project='.length));
    }
  }

  if (selectedProjects.length === 0) {
    return true;
  }

  return selectedProjects.some((name) => name === 'component-scenes');
};

export default defineConfig({
  expect: { timeout: 60_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: './playwright/project-dependencies/global.setup.ts',
  globalTeardown: './playwright/project-dependencies/global.teardown.ts',
  outputDir: './playwright/test-results/artifacts',
  projects: [
    // ── Gating project (tag @gating) ─────────────────────────────────
    {
      fullyParallel: true,
      grep: /@gating/,
      grepInvert: uiGrepInvertSettings,
      name: 'Gating',
      retries: 0,
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: migrationUse,
    },

    // ── Tier1 project ────────────────────────────────────────────────
    {
      fullyParallel: false,
      grep: /@tier1/,
      name: 'Tier1',
      retries: 0,
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: migrationUse,
    },

    // ── Tier2 project ────────────────────────────────────────────────
    {
      fullyParallel: false,
      grep: /@tier2/,
      name: 'Tier2',
      retries: 0,
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
      use: migrationUse,
    },

    // ── Settings project ─────────────────────────────────────────────
    {
      fullyParallel: false,
      grep: /@cnv-settings/,
      name: 'Settings',
      retries: 0,
      testDir: uiTestDir,
      testIgnore: uiTestIgnoreApi,
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

    // ── Component scenes (gallery; multi-widget layouts, no cluster setup) ──
    {
      // Serial worker + shared context: faster gallery mounts; unmount between stories in tests.
      fullyParallel: false,
      name: 'component-scenes',
      retries: 0,
      testDir: './playwright/tests/components',
      testMatch: '**/scenes/**/*.spec.ts',
      timeout: 60_000,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: galleryURL,
        reuseContext: true,
        serviceWorkers: 'block',
      },
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
  ...(shouldStartGalleryWebServer()
    ? {
        webServer: {
          command: 'npm run gallery:dev',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: galleryURL,
        },
      }
    : {}),
});
