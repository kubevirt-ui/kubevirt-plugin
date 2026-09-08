/**
 * Recommended capabilities — guarded single-capability install with Subscription cleanup.
 */

import RequestContextClient from '@/clients/request-context-client';
import {
  ADMIN_ONLY_TAG,
  RECOMMENDED_CAPABILITIES_TAG,
  T2,
  T2_TAG,
} from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import {
  AUTO_CAPABILITY_IDS,
  AUTOPILOT_PACKAGE_NAMES,
  CAPABILITY_STATUS,
  PREFERRED_INSTALL_CAPABILITY_ID,
} from '@/data-models/recommended-capabilities-constants';
import { expect, test } from '@/fixtures/recommended-capabilities-fixture';
import { TestTimeouts } from '@/utils/test-config';

const SUITE = 'Recommended capabilities';
const TAGS = [T2_TAG, RECOMMENDED_CAPABILITIES_TAG];
const SUBSCRIPTION_GROUP = 'operators.coreos.com';
const SUBSCRIPTION_VERSION = 'v1alpha1';
const SUBSCRIPTION_PLURAL = 'subscriptions';

const listSubscriptions = async (
  apiClient: RequestContextClient,
): Promise<KubernetesResource[]> => {
  const result = await apiClient.listResources(
    SUBSCRIPTION_GROUP,
    SUBSCRIPTION_VERSION,
    SUBSCRIPTION_PLURAL,
  );
  return result?.items ?? [];
};

const subscriptionPackageName = (sub: KubernetesResource): string =>
  typeof sub.spec?.name === 'string' ? sub.spec.name : '';

const isNotFoundError = (reason: unknown): boolean => {
  const err = reason as { response?: { status?: number }; message?: string };
  const message = err?.message ?? String(reason);
  return err?.response?.status === 404 || message.includes('404') || message.includes('NotFound');
};

test.describe(
  'Recommended capabilities install',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, RECOMMENDED_CAPABILITIES_TAG] },
  () => {
    const snapshotUids = new Set<string>();

    test.beforeEach(async ({ apiClient, recommendedCapabilitiesPage, utils }) => {
      utils.withAllure({ suite: SUITE, feature: T2, tags: TAGS });
      snapshotUids.clear();
      for (const sub of await listSubscriptions(apiClient)) {
        if (sub.metadata?.uid) snapshotUids.add(sub.metadata.uid);
      }
      await recommendedCapabilitiesPage.navigateViaSidebar();
    });

    test.afterEach(async ({ apiClient }) => {
      const current = await listSubscriptions(apiClient);
      const created = current.filter((sub) => {
        const uid = sub.metadata?.uid;
        const packageName = subscriptionPackageName(sub);
        return (
          Boolean(uid) &&
          !snapshotUids.has(uid) &&
          (AUTOPILOT_PACKAGE_NAMES as readonly string[]).includes(packageName)
        );
      });

      const deletions = created.flatMap((sub) => {
        const name = sub.metadata?.name;
        const namespace = sub.metadata?.namespace;
        if (!name || !namespace) return [];
        return [
          apiClient.deleteResource(
            SUBSCRIPTION_GROUP,
            SUBSCRIPTION_VERSION,
            SUBSCRIPTION_PLURAL,
            name,
            namespace,
          ),
        ];
      });

      const results = await Promise.allSettled(deletions);
      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected' && !isNotFoundError(result.reason),
      );
      if (failures.length > 0) {
        throw new AggregateError(
          failures.map((failure) => failure.reason),
          'Failed to delete test-created Subscriptions',
        );
      }
    });

    test('Install selected starts install for one not-installed autopilot capability', async ({
      recommendedCapabilitiesPage,
    }) => {
      const { capabilities } = recommendedCapabilitiesPage;
      const preferredStatus = await capabilities.getCapabilityStatus(
        PREFERRED_INSTALL_CAPABILITY_ID,
      );
      const capabilityId =
        preferredStatus === CAPABILITY_STATUS.NOT_INSTALLED
          ? PREFERRED_INSTALL_CAPABILITY_ID
          : await capabilities.findCapabilityIdByStatus(
              AUTO_CAPABILITY_IDS,
              CAPABILITY_STATUS.NOT_INSTALLED,
            );

      if (!capabilityId) {
        test.skip(
          true,
          'No not-installed autopilot capability on this cluster; skipping install to avoid changing an already-installed operator',
        );
        return;
      }

      await capabilities.selectCapability(capabilityId);
      await expect(
        capabilities.installSelectedLocator,
        'Install selected should be enabled after checking a not-installed capability',
      ).not.toHaveAttribute('aria-disabled', 'true');

      await capabilities.clickInstallSelected();

      const toast = capabilities.installationToastLocator();
      const installing = capabilities
        .capabilityRow(capabilityId)
        .getByLabel(CAPABILITY_STATUS.INSTALLING);
      await expect(
        toast.or(installing).first(),
        'Install should show a started toast or an Installing spinner',
      ).toBeVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      await expect
        .poll(async () => capabilities.getCapabilityStatus(capabilityId), {
          timeout: TestTimeouts.OPERATOR_INSTALL,
        })
        .not.toBe(CAPABILITY_STATUS.NOT_INSTALLED);
    });
  },
);
