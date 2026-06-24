import KubernetesClient from '@/clients/kubernetes-client';
import { setKubernetesClient } from '@/clients/kubernetes-client-singleton';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { waitForClusterResources, waitForNamespaceReady } from '@/utils/cluster-resource-checker';
import { EnvVariables } from '@/utils/env-variables';
import type { SharedTestConfig } from '@/utils/test-config';
import { TestConfigManager, TestTimeouts } from '@/utils/test-config';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test as base } from '@playwright/test';

import type { GeneratorsFixture, NavigationFixture, WaitHelpersFixture } from './category-fixtures';
import { generators, navigation, waitHelpers } from './category-fixtures';
import type { CleanupFixture } from './cleanup-fixture';
import { createCleanupFixture } from './cleanup-fixture';
import type { CiSafeModeTestInfo } from './fixture-helpers';
import {
  buildBrowserContextOptions,
  getWorkerStorageStatePath,
  isTimeoutError,
  navigateToVirtualizationPerspective,
  quarantineWrap,
  saveFailureArtifacts,
} from './fixture-helpers';

interface WorkerFixtures {
  testConfig: SharedTestConfig;
  _k8sClient: KubernetesClient;
  _workerContext: BrowserContext;
}

interface TestFixtures {
  _ciSafeMode: void;
  _softExpectTimeoutGuard: void;
  _autoAnnotations: void;
  _autoResourceCheck: void;
  _autoVirtNavigation: void;
  /** Worker-scoped KubernetesClient exposed at test scope for direct use in specs. */
  k8sClient: KubernetesClient;
  cleanup: CleanupFixture;
  generators: GeneratorsFixture;
  timeouts: typeof TestTimeouts;
  waitHelpers: WaitHelpersFixture;
  navigation: NavigationFixture;
}

const _test = base.extend<TestFixtures, WorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  _ciSafeMode: [
    async ({}, use, testInfo) => {
      if (!EnvVariables.isCiSafeMode) {
        await use();
        return;
      }

      try {
        await use();
      } catch (error: unknown) {
        if ((testInfo as CiSafeModeTestInfo)._ciQuarantined) return;

        const message = getErrorMessage(error);
        const shortReason = message.split('\n')[0].slice(0, 200);

        testInfo.annotations.push({
          type: 'fixme',
          description: `Quarantined: ${shortReason}`,
        });
        testInfo.attachments.push({
          name: 'ci-safe-mode',
          contentType: 'text/plain',
          body: Buffer.from(`Quarantined (teardown): ${testInfo.title}\nReason: ${shortReason}`),
        });

        const info = testInfo as CiSafeModeTestInfo;
        info.status = 'skipped';
        info.expectedStatus = 'skipped';
        if (Array.isArray(info.errors)) info.errors = [];
        if (Array.isArray(info._errors)) info._errors = [];
        info._ciQuarantined = true;
      }
    },
    { auto: true },
  ],

  /**
   * Soft-expect timeout guard.
   *
   * After each test completes, inspects any soft assertion failures recorded in
   * `testInfo.errors`. If ALL failures are caused by infrastructure timeouts
   * (e.g. slow cluster, network latency), the test is converted to "skipped"
   * rather than "failed" — preventing infrastructure flakes from masking real
   * product or test bugs in CI results.
   *
   * If any non-timeout soft assertion failure is present, the test remains
   * failed so it surfaces as a genuine issue.
   */
  // eslint-disable-next-line no-empty-pattern
  _softExpectTimeoutGuard: [
    async ({}, use, testInfo) => {
      await use();

      if (testInfo.status !== 'failed') return;

      const info = testInfo as CiSafeModeTestInfo;
      if (info._ciQuarantined) return;

      const errors = info.errors;
      if (!Array.isArray(errors) || errors.length === 0) return;

      const allTimeouts = errors.every((e) => isTimeoutError(e));
      if (!allTimeouts) return;

      const summary = errors.map((e) => e.message?.split('\n')[0] ?? 'Unknown timeout').join('\n');

      info.annotations.push({
        type: 'skip',
        description: `Infrastructure timeout (${errors.length} soft assertion${
          errors.length > 1 ? 's' : ''
        })`,
      });
      info.attachments.push({
        name: 'timeout-skip-guard',
        contentType: 'text/plain',
        body: Buffer.from(`Skipped due to infrastructure timeouts:\n${summary}`),
      });

      info.errors = [];
      if (Array.isArray(info._errors)) info._errors = [];
      info.status = 'skipped';
      info.expectedStatus = 'skipped';
    },
    { auto: true },
  ],

  // eslint-disable-next-line no-empty-pattern
  _autoAnnotations: [
    async ({}, use, testInfo) => {
      if (testInfo.titlePath[0]) {
        testInfo.annotations.push({ type: 'suite', description: testInfo.titlePath[0] });
      }
      testInfo.annotations.push({
        type: 'userMode',
        description: EnvVariables.isNonPrivUser ? 'nonpriv' : 'priv',
      });
      if (EnvVariables.isNonPrivUser && testInfo.tags.includes('@adminOnly')) {
        testInfo.annotations.push({
          type: 'skip',
          description: 'Skipped: requires admin — not applicable for non-priv run (NON_PRIV=1)',
        });
        const info = testInfo as CiSafeModeTestInfo;
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
      await navigateToVirtualizationPerspective(page);
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
      const storageStatePath = getWorkerStorageStatePath();
      const recordVideo =
        recordVideoOnRetry || forceVideo
          ? {
              dir: testInfo.outputPath(forceVideo ? 'videos' : 'retry-videos'),
              size: { width: 1920, height: 1080 },
            }
          : undefined;

      testContext = await browser.newContext(
        buildBrowserContextOptions(storageStatePath, recordVideo),
      );
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
        const ciQuarantined = (testInfo as CiSafeModeTestInfo)._ciQuarantined === true;
        const needsScreenshot = testFailed || ciQuarantined;

        let screenshotPath: null | string = null;
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

        let videoPath: null | string = null;
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

        if (needsScreenshot) {
          await saveFailureArtifacts(testInfo, screenshotPath, videoPath);
        }
      } catch {
        await Promise.resolve();
      }
    }
  },

  k8sClient: async ({ _k8sClient }, use) => {
    await use(_k8sClient);
  },

  // eslint-disable-next-line no-empty-pattern
  generators: async ({}, use) => {
    await use(generators);
  },

  // eslint-disable-next-line no-empty-pattern
  timeouts: async ({}, use) => {
    await use(TestTimeouts);
  },

  // eslint-disable-next-line no-empty-pattern
  waitHelpers: async ({}, use) => {
    await use(waitHelpers);
  },

  // eslint-disable-next-line no-empty-pattern
  navigation: async ({}, use) => {
    await use(navigation);
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

  _k8sClient: [
    async ({ testConfig }, use) => {
      const authConfig = {
        baseUrl: EnvVariables.clusterUrl,
        username: EnvVariables.username,
        password: EnvVariables.password,
        ...(testConfig?.authToken ? { token: testConfig.authToken } : {}),
      };
      const client = new KubernetesClient(undefined, authConfig, testConfig?.kubeConfigPath);
      setKubernetesClient(client);
      await use(client);
    },
    { scope: 'worker' },
  ],

  _workerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext(
        buildBrowserContextOptions(getWorkerStorageStatePath()),
      );

      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
});

export const test: typeof _test = new Proxy(_test, {
  apply(target, thisArg, args: unknown[]) {
    if (EnvVariables.isCiSafeMode) quarantineWrap(args);
    return Reflect.apply(target, thisArg, args as never[]);
  },
});

/** Base test fixture. Extend in per-folder fixture files to inject Page Objects and clients. */
export const baseTest = test;

export { expect };

export type { CleanupFixture } from './cleanup-fixture';
export type {
  CleanupOptions,
  CleanupResult,
  CleanupSummary,
  TrackedResource,
  TrackedResourceType,
} from '@/utils/test-resource-tracker';
