/**
 * API Test Fixture
 *
 * Provides a lightweight, browser-less test context for API contract tests that
 * target the same OpenShift console proxy endpoints used by the kubevirt UI.
 *
 * Auth strategy (two-layer):
 *  1. **Session cookies** — the `request` fixture inherits the storage state written
 *     by global setup's `browser-login` rule. The OpenShift console proxy requires
 *     these cookies (`openshift-session-token`) for all requests; Bearer token alone
 *     is not accepted by the console proxy.
 *  2. **Bearer token** (added via `Authorization` header) — provides an additional
 *     explicit credential, read from `.test-config.json`. It is belt-and-suspenders on
 *     top of the session cookies.
 *  3. **CSRF token** — the console proxy sets a `csrf-token` cookie on the first
 *     response; `_buildTokenAuthOptions` reads it back via `storageState()` and
 *     echoes it as `X-CSRFToken` on mutating (POST/PATCH/DELETE) requests.
 *
 * Because the `browser-login` rule must run, `SKIP_BROWSER_SETUP=1` only skips
 * the UI-navigation steps (perspective switch, welcome modal, project selection),
 * NOT the login itself.
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

import KubernetesClient from '@/clients/kubernetes-client';
import OcCliClient from '@/clients/oc-cli-client';
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
  /**
   * RequestContextClient authenticated as the non-privileged test user
   * (`TEST_USERNAME` / `TEST_USER_PASSWORD`, default `test` / `test`).
   *
   * Only available when `NON_PRIV=1` is set. Tests that use this fixture should
   * guard with `test.skip(!utils.EnvVariables.isNonPrivUser, ...)`.
   *
   * The token is obtained via `oc login` (a temp kubeconfig) during fixture setup
   * so no persistent kubeconfig mutation occurs.
   */
  nonPrivApiClient: RequestContextClient;
  /** @internal — auto-applied Allure metadata; not used directly in specs. */
  _allureSetup: void;
  /** Shared test utilities, factories, and constants (same aggregator as UI tests). */
  utils: TestUtilsType;
}

/**
 * Worker-scoped fixtures — one instance per worker, shared by all tests and
 * all beforeAll/afterAll hooks within that worker.
 *
 * Making `testNamespace` and `k8sClient` worker-scoped ensures that the
 * namespace resolved in beforeAll is the same instance seen in individual
 * tests and afterAll — preventing stale or mismatched namespace values.
 */
interface ApiWorkerFixtures {
  /**
   * KubernetesClient connected directly to the cluster API (not via console proxy).
   * Use this for wait/poll operations after console-proxy writes:
   *   - waitForVmExists / waitForVmRunning / waitForVmDeleted
   *   - waitForSnapshotReady
   *   - waitForDataVolumeSucceeded
   */
  k8sClient: KubernetesClient;
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

    if (!config?.authToken) {
      console.warn(
        '[apiClient] No authToken in .test-config.json — relying on storage state cookies for auth.',
      );
    }

    const client = new RequestContextClient(request, {
      baseUrl: EnvVariables.webConsoleUrl,
      username: EnvVariables.username,
      password: EnvVariables.password,
      ...(config?.authToken ? { token: config.authToken } : {}),
    });

    // Prime the csrf-token cookie by fetching the console root page.
    // The OpenShift console only sets csrf-token on HTML responses, not API endpoints.
    await client.primeCsrfToken();

    await use(client);
  },

  // Test-scoped: authenticates as the non-priv test user and returns a
  // RequestContextClient scoped to that identity.
  nonPrivApiClient: async ({ request }, use) => {
    const username = EnvVariables.testUsername;
    const password = EnvVariables.testUserPassword;

    const oc = new OcCliClient(undefined, {
      baseUrl: EnvVariables.clusterUrl,
      username,
      password,
    });

    let token: string;
    try {
      token = await oc.fetchTokenForUser(username, password);
    } catch (err) {
      throw new Error(
        `nonPrivApiClient: could not obtain token for user "${username}". ` +
          `Ensure the user exists in the cluster IDP (run the test suite with NON_PRIV=1 ` +
          `so global setup provisions the htpasswd user). Original error: ${String(err)}`,
      );
    }

    const client = new RequestContextClient(request, {
      baseUrl: EnvVariables.webConsoleUrl,
      username,
      password,
      token,
    });

    // Prime the csrf-token cookie by fetching the console root page.
    await client.primeCsrfToken();

    await use(client);
  },

  // Worker-scoped: one KubernetesClient per worker, reused across all tests.
  k8sClient: [
    async ({}, use) => {
      const config = TestConfigManager.getConfig();
      const authConfig = {
        baseUrl: EnvVariables.clusterUrl,
        username: EnvVariables.username,
        password: EnvVariables.password,
        ...(config?.authToken ? { token: config.authToken } : {}),
      };
      const client = new KubernetesClient(undefined, authConfig, config?.kubeConfigPath);
      await use(client);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: resolved once per worker from config or env fallback.
  testNamespace: [
    async ({}, use) => {
      const config = TestConfigManager.getConfig();
      await use(config?.testNamespace ?? EnvVariables.testNamespace);
    },
    { scope: 'worker' },
  ],
});
