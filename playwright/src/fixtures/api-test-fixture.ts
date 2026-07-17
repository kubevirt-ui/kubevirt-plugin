/**
 * API Test Fixture
 *
 * Provides a lightweight test context for API contract tests that target the
 * same OpenShift console proxy endpoints used by the kubevirt UI.
 *
 * Fixtures provided:
 *  - `apiClient` — RequestContextClient authenticated via session cookies +
 *    optional Bearer token from `.test-config.json`. All API calls go through
 *    the console proxy.
 *  - `testNamespace` — resolved from `.test-config.json` or `TEST_NS` env var.
 *  - `utils` — shared test utilities, factories, and constants.
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '@/fixtures/api-test-fixture';
 *
 * test('VM list endpoint returns a valid list', async ({ apiClient }) => {
 *   const vms = await apiClient.getVirtualMachines();
 *   expect(vms.kind).toBe('VirtualMachineList');
 * });
 * ```
 */

import RequestContextClient from '@/clients/request-context-client';
import { ALLURE_API_FEATURE, withAllure } from '@/utils/allure';
import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager } from '@/utils/test-config';
import { expect, test as base } from '@playwright/test';

import type { TestUtilsType } from './test-utils';
import { getTestUtils } from './test-utils';

export { ALLURE_API_FEATURE, expect };

/** Test-scoped fixtures — one instance per individual test. */
interface ApiTestFixtures {
  /** Pre-configured RequestContextClient using Bearer token auth (no browser). */
  apiClient: RequestContextClient;
  /** @internal — auto-applied Allure metadata; not used directly in specs. */
  _allureSetup: void;
  /** Shared test utilities, factories, and constants (same aggregator as UI tests). */
  utils: TestUtilsType;
}

/**
 * Worker-scoped fixtures — one instance per worker, shared by all tests and
 * all beforeAll/afterAll hooks within that worker.
 */
interface ApiWorkerFixtures {
  /**
   * Target namespace for test resources. Resolution order:
   *   1. `testNamespace` from `.test-config.json` (set by global setup, includes shard suffix)
   *   2. `TEST_NS` env variable
   *   3. `pw-test-ns` (default)
   */
  testNamespace: string;
}

export const test = base.extend<ApiTestFixtures, ApiWorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  utils: async ({}, use) => {
    await use(getTestUtils() as TestUtilsType);
  },

  // Auto-fixture: registers every API test under the "API" Allure Behaviors category.
  _allureSetup: [
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

  // Test-scoped: depends on `request` which is test-scoped.
  apiClient: async ({ request }, use) => {
    const config = TestConfigManager.getConfig();

    const client = new RequestContextClient(request, {
      baseUrl: EnvVariables.webConsoleUrl,
      username: EnvVariables.username,
      password: EnvVariables.password,
      ...(config?.authToken ? { token: config.authToken } : {}),
    });

    await client.primeCsrfToken();

    await use(client);
  },

  // Worker-scoped: resolved once per worker from config or env fallback.
  testNamespace: [
    async ({}, use) => {
      const config = TestConfigManager.getConfig();
      await use(config?.testNamespace ?? EnvVariables.testNamespace);
    },
    { scope: 'worker' },
  ],
});
