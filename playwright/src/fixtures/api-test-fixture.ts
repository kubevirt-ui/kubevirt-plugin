/**
 * API Test Fixture
 *
 * Browserless tests against the OpenShift console Kubernetes proxy, using the
 * same `RequestContextClient` as UI scenario setup (cookie/CSRF from storage state).
 *
 * Unlike UI scenario tests (per-test namespaces), API specs share one namespace per
 * worker so `beforeAll` / `afterAll` hooks can create and clean up resources.
 */

import RequestContextClient from '@/clients/request-context-client';
import { ALLURE_API_FEATURE, withAllure } from '@/utils/allure';
import { E2E_LABEL, E2E_LABEL_VALUE } from '@/utils/constants';
import { EnvVariables } from '@/utils/env-variables';
import { generateE2eTestNamespace } from '@/utils/random-data-generator';
import { getStorageStatePath, storageStateExists } from '@/utils/storage-state';
import { expect, request as playwrightRequest, test as base } from '@playwright/test';

import type { TestUtilsType } from './test-utils';
import { getTestUtils } from './test-utils';

export { ALLURE_API_FEATURE, expect };

interface ApiTestFixtures {
  apiClient: RequestContextClient;
  _allureSetup: void;
  utils: TestUtilsType;
}

interface ApiWorkerFixtures {
  testNamespace: string;
  _apiClient: RequestContextClient;
}

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  utils: async ({}, use) => {
    await use(getTestUtils());
  },

  _allureSetup: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      await withAllure({
        feature: ALLURE_API_FEATURE,
        suite: testInfo.titlePath[0] ?? 'API Tests',
        tags: ['@api'],
      });
      await use();
    },
    { auto: true },
  ],

  _apiClient: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const storageStatePath = getStorageStatePath();
      const apiContext = await playwrightRequest.newContext({
        baseURL: EnvVariables.webConsoleUrl,
        ignoreHTTPSErrors: true,
        ...(storageStateExists() ? { storageState: storageStatePath } : {}),
      });
      const client = new RequestContextClient(apiContext, EnvVariables.webConsoleUrl);
      await client.refreshCsrfFromContext();
      await use(client);
      await apiContext.dispose();
    },
    { scope: 'worker' },
  ],

  apiClient: async ({ _apiClient }, use) => {
    await _apiClient.refreshCsrfFromContext();
    await use(_apiClient);
  },

  /**
   * Worker-scoped namespace for API CRUD.
   * Prefer `TEST_NAMESPACE` when set; otherwise create an isolated `pw-…` namespace
   * (same generator as UI scenario fixtures) and delete it when the worker finishes.
   */
  testNamespace: [
    async ({ _apiClient }, use, workerInfo) => {
      const fromEnv = EnvVariables.testNamespace.trim();
      const ns =
        fromEnv ||
        generateE2eTestNamespace(workerInfo.workerIndex, `api-w${workerInfo.workerIndex}`);
      await _apiClient.ensureNamespace(ns);
      try {
        await _apiClient.labelNamespace(ns, E2E_LABEL, E2E_LABEL_VALUE);
      } catch {
        // Label is best-effort for cleanup bookkeeping.
      }
      await use(ns);
      if (!fromEnv) {
        await _apiClient.deleteNamespace(ns).catch(() => undefined);
      }
    },
    { scope: 'worker' },
  ],
});
