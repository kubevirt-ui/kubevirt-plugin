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

import type RequestContextClient from '@/clients/request-context-client';
import { getApiClient } from '@/clients/rcc-singleton';
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
  client: RequestContextClient,
  namespace: string,
): Promise<void> {
  const migrationKinds = [
    'multinamespacevirtualmachinestoragemigrationplans.migrations.kubevirt.io',
    'virtualmachinestoragemigrationplans.storagemigration.kubevirt.io',
  ];

  for (const kind of migrationKinds) {
    try {
      const result = await client.listResourcesByKind(kind, namespace);
      await Promise.allSettled(
        (result.items ?? []).map((plan) => {
          const name = plan.metadata?.name;
          if (!name) return Promise.resolve();
          return client.deleteResourceByKind(kind, name, namespace).catch(() => undefined);
        }),
      );
    } catch {
      // CRD not installed or empty — continue
    }
  }

  // Strip finalizers from DataVolumes stuck in Terminating (CDI finalizers block namespace deletion)
  try {
    const result = await client.listResourcesByKind('datavolume', namespace);
    await Promise.allSettled(
      (result.items ?? [])
        .filter((dv) => dv.metadata?.deletionTimestamp && dv.metadata?.finalizers?.length)
        .map((dv) => {
          const name = dv.metadata?.name;
          if (!name) return Promise.resolve();
          return client
            .patchResourceByKind(
              'datavolume',
              name,
              [{ op: 'replace', path: '/metadata/finalizers', value: [] }],
              namespace,
              'json',
            )
            .catch(() => undefined);
        }),
    );
  } catch {
    // CDI not installed or no DVs — continue
  }
}

function resolveResourceKind(resource: TrackedResource): string {
  if (resource.apiGroup === '') {
    return resource.type.toLowerCase();
  }
  if (resource.plural) {
    return resource.apiGroup ? `${resource.plural}.${resource.apiGroup}` : resource.plural;
  }
  return resource.type.toLowerCase();
}

function createDeleteCallback(): (resource: TrackedResource) => Promise<boolean> {
  return async (resource: TrackedResource): Promise<boolean> => {
    const client = getApiClient();
    if (!client) {
      return false;
    }

    try {
      if (resource.type === 'Namespace') {
        await sweepNamespaceBeforeDeletion(client, resource.name);
        await client.deleteProject(resource.name);
        return true;
      }

      // For VirtualMachines, disable delete protection before deleting
      if (resource.type === 'VirtualMachine' && resource.namespace) {
        try {
          await client.patchResourceByKind(
            'vm',
            resource.name,
            {
              metadata: { labels: { 'kubevirt.io/delete-protection': null } },
              spec: {
                template: {
                  metadata: { labels: { 'kubevirt.io/delete-protection': null } },
                },
              },
            },
            resource.namespace,
            'merge',
          );
          await new Promise((resolve) => setTimeout(resolve, TestTimeouts.UI_DELAY_SHORT));
        } catch {
          // Ignore errors - protection might not be set
        }
      }

      const kind = resolveResourceKind(resource);
      const namespace = resource.isClusterScoped ? undefined : resource.namespace;

      if (!resource.isClusterScoped && !resource.namespace) {
        return false;
      }

      try {
        await client.deleteResourceByKind(kind, resource.name, namespace);
      } catch (deleteError: unknown) {
        const msg = deleteError instanceof Error ? deleteError.message : String(deleteError);
        if (!msg.includes('404') && !msg.includes('not found')) {
          throw deleteError;
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
