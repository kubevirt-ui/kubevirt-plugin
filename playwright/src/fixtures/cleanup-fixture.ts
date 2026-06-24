/**
 * Cleanup Fixture - Per-Test Resource Cleanup.
 * Provides automatic cleanup of Kubernetes resources created during tests.
 * Integrates with TestResourceTracker to track and clean up resources after each test.
 *
 * Resources are registered automatically by step drivers via
 * {@link ScenarioContextManager.trackResource}. The fixture drains the context
 * manager's tracked resources before executing cleanup, so spec files do not
 * need to call `cleanup.track*()` manually.
 */

import { getKubernetesClient } from '@/clients/kubernetes-client-singleton';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import { TestTimeouts } from '@/utils/test-config';
import type {
  CleanupOptions,
  CleanupSummary,
  TestResourceTracker,
  TrackedResource,
} from '@/utils/test-resource-tracker';
import { createResourceTracker } from '@/utils/test-resource-tracker';

export interface CleanupFixture extends TestResourceTracker {
  executeCleanup(options?: CleanupOptions): Promise<CleanupSummary>;
  setSkipCleanup(skip: boolean): void;
  shouldSkipCleanup(): boolean;
}

export interface CleanupFixtureOptions {
  defaultNamespace?: string;
  skipByDefault?: boolean;
  verbose?: boolean;
  timeoutPerResource?: number;
}

/**
 * Sweep storage migration plans and strip finalizers from blocking resources
 * inside a namespace before attempting namespace deletion. This prevents the
 * namespace from getting stuck in Terminating due to CDI finalizers on
 * intermediate DataVolumes created by cancelled/in-progress migrations.
 */
async function sweepNamespaceBeforeDeletion(
  client: NonNullable<ReturnType<typeof getKubernetesClient>>,
  namespace: string,
): Promise<void> {
  const migrationCrds = [
    {
      group: 'migrations.kubevirt.io',
      version: 'v1alpha1',
      plural: 'multinamespacevirtualmachinestoragemigrationplans',
    },
    {
      group: 'storagemigration.kubevirt.io',
      version: 'v1alpha1',
      plural: 'virtualmachinestoragemigrationplans',
    },
  ];

  for (const { group, version, plural } of migrationCrds) {
    try {
      const plans = await client.listCustomResources(group, version, namespace, plural);
      await Promise.allSettled(
        plans.map((plan: { metadata?: { name?: string } }) => {
          const name = plan.metadata?.name;
          if (!name) return Promise.resolve();
          return client
            .deleteCustomResource(group, version, namespace, plural, name)
            .catch(() => undefined);
        }),
      );
    } catch {
      // CRD not installed or empty — continue
    }
  }

  try {
    const dvs = await client.listCustomResources(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
    );
    await Promise.allSettled(
      dvs
        .filter(
          (dv: { metadata?: { deletionTimestamp?: string; finalizers?: string[] } }) =>
            dv.metadata?.deletionTimestamp && dv.metadata?.finalizers?.length,
        )
        .map((dv: { metadata?: { name?: string } }) => {
          const name = dv.metadata?.name;
          if (!name) return Promise.resolve();
          return client
            .patchResource('cdi.kubevirt.io', 'v1beta1', 'datavolumes', name, namespace, [
              { op: 'replace', path: '/metadata/finalizers', value: [] },
            ])
            .catch(() => undefined);
        }),
    );
  } catch {
    // CDI not installed or no DVs — continue
  }
}

function createDeleteCallback(): (resource: TrackedResource) => Promise<boolean> {
  return async (resource: TrackedResource): Promise<boolean> => {
    const client = getKubernetesClient();
    if (!client) {
      return false;
    }

    try {
      if (resource.apiGroup === '') {
        const coreApi = client.getCoreV1Api();
        const namespace = resource.namespace;

        switch (resource.type) {
          case 'Secret':
            if (!namespace) throw new Error('Namespace is required for Secret');
            await coreApi.deleteNamespacedSecret({
              name: resource.name,
              namespace,
            });
            break;
          case 'ConfigMap':
            if (!namespace) throw new Error('Namespace is required for ConfigMap');
            await coreApi.deleteNamespacedConfigMap({
              name: resource.name,
              namespace,
            });
            break;
          case 'PersistentVolumeClaim':
            if (!namespace) throw new Error('Namespace is required for PersistentVolumeClaim');
            await coreApi.deleteNamespacedPersistentVolumeClaim({
              name: resource.name,
              namespace,
            });
            break;
          case 'Service':
            if (!namespace) throw new Error('Namespace is required for Service');
            await coreApi.deleteNamespacedService({
              name: resource.name,
              namespace,
            });
            break;
          case 'Namespace':
            await sweepNamespaceBeforeDeletion(client, resource.name);
            await coreApi.deleteNamespace({
              name: resource.name,
            });
            break;
          default:
            return false;
        }
      } else {
        // For VirtualMachines, disable delete protection before deleting
        if (resource.type === 'VirtualMachine' && resource.namespace) {
          try {
            await client.disableDeleteProtection(resource.name, resource.namespace);
            // Small delay to ensure the patch is applied
            await new Promise((resolve) => setTimeout(resolve, TestTimeouts.UI_DELAY_SHORT));
          } catch {
            // Ignore errors - protection might not be set
          }
        }

        if (resource.isClusterScoped) {
          await client.deleteClusterCustomResource(
            resource.apiGroup,
            resource.apiVersion,
            resource.plural,
            resource.name,
          );
        } else {
          if (!resource.namespace) {
            return false;
          }
          await client.deleteCustomResource(
            resource.apiGroup,
            resource.apiVersion,
            resource.namespace,
            resource.plural,
            resource.name,
          );
        }
      }

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        return true;
      }

      throw error;
    }
  };
}

export function createCleanupFixture(
  testName: string,
  options: CleanupFixtureOptions = {},
): CleanupFixture {
  const {
    skipByDefault = false,
    verbose = false,
    timeoutPerResource = TestTimeouts.DEFAULT,
  } = options;

  const tracker = createResourceTracker(testName);

  let skipCleanup = skipByDefault;

  if (process.env.SKIP_TEST_CLEANUP === 'true' || process.env.DEBUG === '1') {
    skipCleanup = true;
  }

  const fixture: CleanupFixture = Object.assign(tracker, {
    async executeCleanup(cleanupOptions: CleanupOptions = {}): Promise<CleanupSummary> {
      const contextManager = ScenarioContextManager.getInstance();
      const contextResources = contextManager.drainTrackedResources();
      for (const r of contextResources) {
        tracker.track(r.type, r.name, r.namespace);
      }

      const deleteCallback = createDeleteCallback();

      const mergedOptions: CleanupOptions = {
        continueOnError: true,
        timeoutPerResource,
        verbose,
        skip: skipCleanup,
        ...cleanupOptions,
      };

      return await tracker.cleanup(deleteCallback, mergedOptions);
    },

    setSkipCleanup(skip: boolean): void {
      skipCleanup = skip;
    },

    shouldSkipCleanup(): boolean {
      return skipCleanup;
    },
  });

  return fixture;
}

export const cleanupFixtureDefinition = async (
  {}: Record<string, never>,
  use: (fixture: CleanupFixture) => Promise<void>,
  testInfo: { title: string; titlePath: string[] },
): Promise<void> => {
  const testName = testInfo.titlePath.join(' > ');

  const cleanup = createCleanupFixture(testName);

  try {
    await use(cleanup);
  } finally {
    if (!cleanup.shouldSkipCleanup() && cleanup.count > 0) {
      try {
        await cleanup.executeCleanup();
      } catch {
        // Don't throw - cleanup errors shouldn't fail the test
      }
    }
  }
};
