/**
 * Base E2E fixture (main-style `scenario-test-fixture`).
 *
 * - `apiClient` — `RequestContextClient` (console `/api/kubernetes` proxy)
 * - `testNamespace` — per-test isolated namespace
 * - `nav` — Virtualization navigation helper
 *
 * ```typescript
 * import { test, expect } from '@/fixtures/scenario-test-fixture';
 * ```
 */
import RequestContextClient from '@/clients/request-context-client';
import { NavigationPage } from '@/page-objects/navigation-page';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { E2E_LABEL, E2E_LABEL_VALUE } from '@/utils/constants';
import { EnvVariables } from '@/utils/env-variables';
import { generateE2eTestNamespace } from '@/utils/random-data-generator';
import { getStorageStatePath, storageStateExists } from '@/utils/storage-state';
import { TestTimeouts } from '@/utils/test-config';
import { test as base, expect, request as playwrightRequest } from '@playwright/test';

interface Fixtures {
  _autoAnnotations: void;
  /** Patches `kubevirt-ui-features` → `instanceTypesEnabled=true` via console API before each test. */
  _ensureInstanceTypesDeveloperPreview: void;
  apiClient: RequestContextClient;
  nav: NavigationPage;
  testNamespace: string;
}

interface WorkerFixtures {
  _apiClient: RequestContextClient;
}

const _test = base.extend<Fixtures, WorkerFixtures>({
  _apiClient: [
    // Worker scope: cannot use the test-scoped `request` fixture (Playwright builtin).
    async ({}, use) => {
      const storageStatePath = getStorageStatePath();
      const apiContext = await playwrightRequest.newContext({
        baseURL: EnvVariables.webConsoleUrl,
        ignoreHTTPSErrors: true,
        ...(storageStateExists() ? { storageState: storageStatePath } : {}),
      });
      const client = new RequestContextClient(apiContext, EnvVariables.webConsoleUrl);
      await use(client);
      await apiContext.dispose();
    },
    { scope: 'worker' },
  ],

  _autoAnnotations: [
    async ({}, use, testInfo) => {
      if (testInfo.titlePath[0]) {
        testInfo.annotations.push({ description: testInfo.titlePath[0], type: 'suite' });
      }
      try {
        const { allure } = await import('allure-playwright');
        if (allure) {
          await allure.label('userMode', EnvVariables.isNonPrivUser ? 'nonpriv' : 'priv');
        }
      } catch {
        await Promise.resolve();
      }
      await use();
    },
    { auto: true },
  ],

  _ensureInstanceTypesDeveloperPreview: [
    async ({ apiClient }, use) => {
      await apiClient.enableInstanceTypesDeveloperPreview();
      await use();
    },
    { auto: true },
  ],

  apiClient: async ({ _apiClient }, use) => {
    await use(_apiClient);
  },

  nav: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },

  page: async ({ baseURL, page }, use) => {
    const entry = baseURL ?? EnvVariables.webConsoleUrl;
    await page.goto(entry, {
      timeout: TestTimeouts.CONSOLE_LOGIN,
      waitUntil: 'domcontentloaded',
    });
    if (page.url().includes('/auth/login')) {
      throw new Error(
        'Console session is not authenticated. Re-run global setup (remove REUSE_STORAGE_STATE or delete .storage-states/*.json).',
      );
    }
    await page
      .locator('[data-test-id="perspective-switcher-toggle"]')
      .waitFor({ state: 'visible', timeout: TestTimeouts.CONSOLE_LOGIN });
    await dismissConsoleObstructions(page);
    await use(page);
  },

  testNamespace: async ({ apiClient }, use, testInfo) => {
    const ns = generateE2eTestNamespace(testInfo.workerIndex, testInfo.title);
    await apiClient.ensureNamespace(ns, EnvVariables.isNonPrivUser);
    try {
      await apiClient.labelNamespace(ns, E2E_LABEL, E2E_LABEL_VALUE);
    } catch {
      // ignore label failures
    }
    await use(ns);
    await apiClient.deleteNamespace(ns);
  },
});

export const test = _test;

/** Alias for layered fixtures (gating/tier-specific), same as on `main`. */
export const baseTest = test;

export { expect };
