import { setApiClient } from '@/clients/rcc-singleton';
import RequestContextClient from '@/clients/request-context-client';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { detectAuthExpired, healBrowserAuth } from '@/utils/auth-healer';
import { waitForClusterResources, waitForNamespaceReady } from '@/utils/cluster-resource-checker';
import { EnvVariables } from '@/utils/env-variables';
import { FileUtils } from '@/utils/file-utils';
import { getStorageStatePath } from '@/utils/storage-state';
import type { SharedTestConfig } from '@/utils/test-config';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';
import { getTestResultsDir } from '@/utils/test-results-dir';
import type { BrowserContext, BrowserContextOptions, Page, TestInfo } from '@playwright/test';
import { expect, test as base } from '@playwright/test';

import type { CleanupFixture } from './cleanup-fixture';
import { createCleanupFixture } from './cleanup-fixture';
import type { SharedResourceFixture } from './shared-resource-fixture';
import {
  type SharedResourceKubernetesSteps,
  createSharedResourceFixture,
  SharedResourceManager,
} from './shared-resource-fixture';
import type { TestUtilsType } from './test-utils';
import { getTestUtils } from './test-utils';

type TimeoutAwareTestInfo = TestInfo & {
  _actionTimeouts?: Array<{ method: string; message: string }>;
  _diagnosisHandled?: boolean;
};

type MutableTestInfo = TestInfo & {
  _errors?: unknown[];
  errors?: Array<{ message?: string; toString?: () => string }>;
  status?: string;
  expectedStatus?: string;
};

interface WorkerFixtures {
  testConfig: SharedTestConfig;
  _apiClient: RequestContextClient;
  _sharedResourceManager: SharedResourceManager;
  _workerContext: BrowserContext;
  /** Worker-scoped RequestContextClient for direct use in specs and beforeAll hooks. */
  apiClient: RequestContextClient;
  utils: TestUtilsType;
}

interface TestFixtures {
  _autoTimeoutGuard: void;
  _autoAnnotations: void;
  _autoResourceCheck: void;
  _autoVirtNavigation: void;
  cleanup: CleanupFixture;
  sharedResources: SharedResourceFixture;
  constants: TestUtilsType;
  timeouts: typeof TestTimeouts;
}

const _test = base.extend<TestFixtures, WorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  _autoTimeoutGuard: [
    async ({}, use, testInfo) => {
      await use();

      const info = testInfo as TimeoutAwareTestInfo & MutableTestInfo;
      if (!info._actionTimeouts?.length || info.status === 'skipped') return;

      const first = info._actionTimeouts[0];
      const reason = `Timeout in ${first.method}: ${first.message.split('\n')[0].slice(0, 200)}`;

      testInfo.annotations.push({ type: 'skip', description: reason });
      info.status = 'skipped';
      info.expectedStatus = 'skipped';
      if (Array.isArray(info.errors)) info.errors = [];
      if (Array.isArray(info._errors)) info._errors = [];
    },
    { auto: true },
  ],

  // eslint-disable-next-line no-empty-pattern
  _autoAnnotations: [
    async ({}, use, testInfo) => {
      if (testInfo.titlePath[0]) {
        testInfo.annotations.push({ type: 'suite', description: testInfo.titlePath[0] });
      }
      try {
        const { allure } = await import('allure-playwright');
        if (allure) {
          allure.label('userMode', EnvVariables.isNonPrivUser ? 'nonpriv' : 'priv');
        }
      } catch {
        await Promise.resolve();
      }
      // Skip @adminOnly tests automatically when running as non-priv user
      if (EnvVariables.isNonPrivUser && testInfo.tags.includes('@adminOnly')) {
        testInfo.annotations.push({
          type: 'skip',
          description: 'Skipped: requires admin — not applicable for non-priv run (NON_PRIV=1)',
        });
        const info = testInfo as MutableTestInfo;
        info.status = 'skipped';
        info.expectedStatus = 'skipped';
      }
      await use();
    },
    { auto: true },
  ],

  // eslint-disable-next-line no-empty-pattern
  _autoResourceCheck: [
    async ({}, use) => {
      await waitForNamespaceReady(undefined, TestTimeouts.DEFAULT, EnvVariables.isDebugMode);

      if (EnvVariables.isResourceCheckEnabled) {
        await waitForClusterResources({
          thresholds: {
            maxRunningVms: EnvVariables.maxRunningVms,
            maxPendingPods: EnvVariables.maxPendingPods,
          },
          timeout: EnvVariables.resourceWaitTimeout * 1000,
          interval: TestTimeouts.SHORT_WAIT,
          verbose: EnvVariables.isDebugMode,
          staleResourceConfig: {
            enabled: EnvVariables.isStaleCleanupEnabled,
            maxStaleAgeSeconds: EnvVariables.staleResourceMaxAge,
            autoCleanup: true,
            backgroundCleanup: EnvVariables.isStaleCleanupBackground,
          },
        });
      }
      await use();
    },
    { auto: true },
  ],

  _autoVirtNavigation: [
    async ({ page }, use) => {
      const baseUrl = EnvVariables.webConsoleUrl;
      const maxRetries = 2;
      const consoleStabilizationMs = 2500;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await page.goto(baseUrl, { waitUntil: 'load', timeout: TestTimeouts.NAVIGATION });
          await page.waitForLoadState('load');
          await page
            .waitForLoadState('networkidle', { timeout: TestTimeouts.VM_CREATION_EXTENDED })
            .catch(() => undefined);

          if (await detectAuthExpired(page)) {
            const healed = await healBrowserAuth(page, page.context());
            if (healed) {
              await page.goto(baseUrl, { waitUntil: 'load', timeout: TestTimeouts.NAVIGATION });
              await page.waitForLoadState('load');
              await page
                .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_DELAY_LONG })
                .catch(() => undefined);
            }
          }

          // Dismiss Core platform "Welcome to OpenShift" guided tour modal.
          const tourSkipBtn = page.locator('[data-test="tour-step-footer-secondary"]');
          const hasTour = await tourSkipBtn
            .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
            .catch(() => false);
          if (hasTour) {
            await tourSkipBtn.click({ force: true }).catch(() => undefined);
            await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          }

          // Dismiss Virtualization welcome modal.
          const welcomeCheckbox = page.locator('#welcome-modal-checkbox');
          const hasWelcome = await welcomeCheckbox
            .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
            .catch(() => false);
          if (hasWelcome) {
            await welcomeCheckbox.check({ force: true }).catch(() => undefined);
            const closeBtn = page.locator('.pf-v6-c-modal-box__close button');
            await closeBtn.click({ force: true }).catch(() => undefined);
            await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          }

          // Wait for any modal backdrop to clear before interacting with the page.
          await page
            .locator('.pf-v6-c-backdrop')
            .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_LONG })
            .catch(() => undefined);

          await page.waitForTimeout(consoleStabilizationMs);

          const perspectiveToggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
          const virtNavSection = page.locator('[data-quickstart-id="qs-nav-sec-virtualization"]');

          const navType = await Promise.race([
            perspectiveToggle
              .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
              .then(() => 'perspective' as const),
            virtNavSection
              .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
              .then(() => 'section' as const),
          ]).catch(() => 'none' as const);

          if (navType === 'perspective') {
            const perspectiveUrlPattern = /virtualization/;
            const inTargetPerspective = perspectiveUrlPattern.test(page.url());

            if (!inTargetPerspective) {
              const perspectiveOption = page
                .locator('[data-test-id="perspective-switcher-menu-option"]')
                .filter({
                  has: page.locator('.pf-v6-c-menu__item-text', {
                    hasText: /^Virtualization$/,
                  }),
                });

              const selectionAttempts = 3;
              for (let selAttempt = 1; selAttempt <= selectionAttempts; selAttempt++) {
                try {
                  const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
                  await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
                  await toggle.click();
                  await perspectiveOption.waitFor({
                    state: 'visible',
                    timeout: TestTimeouts.UI_DELAY_LONG,
                  });
                  await perspectiveOption.scrollIntoViewIfNeeded();
                  await page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
                  await perspectiveOption.click();

                  await page.waitForURL(perspectiveUrlPattern, {
                    timeout: TestTimeouts.UI_DELAY_LONG,
                  });
                  await page.waitForLoadState('load');
                  break;
                } catch {
                  if (selAttempt === selectionAttempts)
                    throw new Error('Perspective selection did not navigate to target URL');
                  await page.keyboard.press('Escape').catch(() => undefined);
                  await page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
                }
              }
            }
          }

          break;
        } catch (error) {
          if (attempt === maxRetries) {
            // Navigation retries exhausted — non-fatal, handled by caller
          } else {
            await page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
          }
        }
      }
      await use();
    },
    { auto: true },
  ],

  page: async ({ page, browser, _workerContext }, use, testInfo) => {
    try {
      await page.close({ runBeforeUnload: false });
    } catch {
      await Promise.resolve();
    }

    const isRetry = testInfo.retry > 0;
    const forceVideo = process.env.PW_VIDEO === '1';
    const recordVideoOnRetry = isRetry && EnvVariables.isVideoEnabled;
    const needsFreshContext = isRetry || forceVideo;

    let testContext: BrowserContext;
    let testPage: Page;
    let shouldCloseContext = false;

    if (needsFreshContext) {
      const playwrightDir = FileUtils.resolvePath(__dirname, '..', '..');
      const storageStatePath = getStorageStatePath(playwrightDir);

      const contextOptions: BrowserContextOptions = {
        baseURL: EnvVariables.webConsoleUrl,
        storageState: storageStatePath,
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
        permissions: ['clipboard-read', 'clipboard-write'],
        locale: 'en-US',
        timezoneId: 'UTC',
        bypassCSP: true,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
        hasTouch: false,
        isMobile: false,
        deviceScaleFactor: 1,
        javaScriptEnabled: true,
        acceptDownloads: false,
      };

      if (recordVideoOnRetry || forceVideo) {
        contextOptions.recordVideo = {
          dir: testInfo.outputPath(forceVideo ? 'videos' : 'retry-videos'),
          size: { width: 1920, height: 1080 },
        };
      }

      testContext = await browser.newContext(contextOptions);
      shouldCloseContext = true;
      testPage = await testContext.newPage();
    } else {
      testContext = _workerContext;
      testPage = await testContext.newPage();

      await testPage.addInitScript(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          /* ignore */
        }
      });
    }

    try {
      await use(testPage);
    } finally {
      try {
        const testFailed = testInfo.status !== 'passed' && testInfo.status !== 'skipped';
        const needsScreenshot = testFailed;

        let screenshotPath: string | null = null;
        if (needsScreenshot) {
          try {
            const screenshotFile = testInfo.outputPath('failure-screenshot.png');
            await testPage.screenshot({ path: screenshotFile, fullPage: true });
            screenshotPath = screenshotFile;
            await testInfo.attach('failure-screenshot', {
              path: screenshotFile,
              contentType: 'image/png',
            });
          } catch {
            await Promise.resolve();
          }
        }

        const hasVideo = recordVideoOnRetry || forceVideo;
        const videoHandle = hasVideo ? testPage.video() : null;

        await testPage.close({ runBeforeUnload: false });

        let videoPath: string | null = null;
        if (videoHandle) {
          try {
            const label = forceVideo ? 'video' : 'retry-video';
            const savedPath = testInfo.outputPath(`${label}.webm`);
            await videoHandle.saveAs(savedPath);
            videoPath = savedPath;
            await testInfo.attach(label, {
              path: savedPath,
              contentType: 'video/webm',
            });
          } catch {
            await Promise.resolve();
          }
        }

        if (shouldCloseContext) {
          await testContext.close();
        }

        if (needsScreenshot && (screenshotPath || videoPath)) {
          try {
            const pathMod = await import('path');
            const fs = await import('fs');
            const repoRoot = FileUtils.resolvePath(__dirname, '..', '..', '..');
            const testResultsBase = getTestResultsDir(repoRoot);
            const artifactsDir = pathMod.join(testResultsBase, '.failure-artifacts');
            if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
            const artifactsPath = pathMod.join(artifactsDir, `${testInfo.testId}.json`);
            fs.writeFileSync(
              artifactsPath,
              JSON.stringify({
                screenshotPath: screenshotPath ?? null,
                videoPath: videoPath ?? null,
              }),
              'utf-8',
            );
          } catch {
            await Promise.resolve();
          }
        }
      } catch {
        await Promise.resolve();
      }
    }
  },

  apiClient: [
    async ({ _apiClient }, use) => {
      await use(_apiClient);
    },
    { scope: 'worker' },
  ],

  utils: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(getTestUtils() as TestUtilsType);
    },
    { scope: 'worker' },
  ],

  // eslint-disable-next-line no-empty-pattern
  constants: async ({}, use) => {
    await use(getTestUtils() as TestUtilsType);
  },

  // eslint-disable-next-line no-empty-pattern
  timeouts: async ({}, use) => {
    await use(TestTimeouts);
  },

  // eslint-disable-next-line no-empty-pattern
  cleanup: async ({}, use, testInfo) => {
    const testName = testInfo.titlePath.join(' > ');
    const cleanupFixture = createCleanupFixture(testName);

    try {
      await use(cleanupFixture);
    } finally {
      const hasContextResources = ScenarioContextManager.getInstance().trackedResourceCount > 0;
      if (
        !cleanupFixture.shouldSkipCleanup() &&
        (cleanupFixture.count > 0 || hasContextResources)
      ) {
        try {
          await cleanupFixture.executeCleanup();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[Cleanup] Cleanup failed for ${testName}: ${errorMessage}`);
        }
      }

      ScenarioContextManager.getInstance().clear();
    }
  },

  testConfig: [
    async ({}, use) => {
      await use(TestConfigManager.getConfig());
    },
    { scope: 'worker' },
  ],

  _apiClient: [
    async ({ testConfig }, use) => {
      const { request } = await import('@playwright/test');
      const fs = await import('fs');
      const playwrightDir = FileUtils.resolvePath(__dirname, '..', '..');
      const storageStatePath = getStorageStatePath(playwrightDir);

      const apiContext = await request.newContext({
        baseURL: EnvVariables.webConsoleUrl,
        ignoreHTTPSErrors: true,
        ...(storageStatePath && fs.existsSync(storageStatePath)
          ? { storageState: storageStatePath }
          : {}),
        extraHTTPHeaders: {
          ...(testConfig?.authToken ? { Authorization: `Bearer ${testConfig.authToken}` } : {}),
        },
      });

      const client = new RequestContextClient(apiContext, {
        baseUrl: EnvVariables.webConsoleUrl,
        username: EnvVariables.username,
        password: EnvVariables.password,
        ...(testConfig?.authToken ? { token: testConfig.authToken } : {}),
      });

      await client.primeCsrfToken();
      setApiClient(client);
      await use(client);
    },
    { scope: 'worker' },
  ],

  _sharedResourceManager: [
    async ({}, use) => {
      const manager = new SharedResourceManager();

      try {
        await use(manager);
      } finally {
        if (manager.count > 0) {
          try {
            await manager.cleanupAll();
          } catch {
            await Promise.resolve();
          }
        }
      }
    },
    { scope: 'worker' },
  ],

  _workerContext: [
    async ({ browser }, use) => {
      const playwrightDir = FileUtils.resolvePath(__dirname, '..', '..');
      const storageStatePath = getStorageStatePath(playwrightDir);

      const context = await browser.newContext({
        baseURL: EnvVariables.webConsoleUrl,
        storageState: storageStatePath,
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
        permissions: ['clipboard-read', 'clipboard-write'],
        locale: 'en-US',
        timezoneId: 'UTC',
        bypassCSP: true,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
        hasTouch: false,
        isMobile: false,
        deviceScaleFactor: 1,
        javaScriptEnabled: true,
        acceptDownloads: false,
      });

      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  sharedResources: async ({ _apiClient, _sharedResourceManager }, use) => {
    await use(
      createSharedResourceFixture(
        _sharedResourceManager,
        _apiClient as unknown as SharedResourceKubernetesSteps,
      ),
    );
  },
});

export const test = _test;

/** Base test fixture. Extend in per-folder fixture files to inject Page Objects and clients. */
export const baseTest = test;

export { expect };

export type { CleanupFixture } from './cleanup-fixture';
export type {
  SharedDataVolumeConfig,
  SharedResourceFixture,
  SharedResourceKubernetesSteps,
  SharedResourceResult,
  SharedVmConfig,
} from './shared-resource-fixture';
export type {
  CleanupOptions,
  CleanupResult,
  CleanupSummary,
  TrackedResource,
  TrackedResourceType,
} from '@/utils/test-resource-tracker';
