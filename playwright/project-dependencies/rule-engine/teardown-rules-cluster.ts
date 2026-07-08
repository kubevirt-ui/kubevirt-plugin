import { ClusterJanitor } from '@/utils/cluster-janitor';
import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { removeNonPrivUser } from '@/utils/nonpriv-utils';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

function safeWarn(message: string, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err);
  logger.warn(`${message}: ${detail}`);
}

export function getClusterTeardownRules(): TeardownRule[] {
  return [
    {
      id: 'cleanup-migration-policies',
      name: 'Clean up cluster-scoped migration policies',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          const k8sClient = ctx.k8sClient;
          const group = 'migrations.kubevirt.io';
          const version = 'v1alpha1';
          const plural = 'migrationpolicies';

          const testPrefixes = [
            'pw-test-migration-policy-',
            'pw-smoke-migration-policy-',
            'pw-minimal-migration-policy-',
            'pw-auto-converge-policy-',
            'pw-bandwidth-policy-',
            'pw-selector-policy-',
            'pw-edge-case-policy-',
            'pw-existence-check-policy-',
            'pw-complex-config-policy-',
            'pw-test-form-policy-',
            'pw-smoke-form-policy-',
            'pw-edge-case-form-policy-',
            'pw-minimal-form-policy-',
            'pw-form-existence-check-',
            'pw-policy-yaml-',
            'pw-policy-form-',
          ];

          const items = await k8sClient.listClusterCustomResources(group, version, plural);

          await Promise.allSettled(
            items
              .filter((p) => {
                const name = p.metadata?.name;
                return name && testPrefixes.some((pfx) => name.startsWith(pfx));
              })
              .map((p) => {
                const name = p.metadata?.name;
                if (!name) return Promise.resolve();
                return k8sClient
                  .deleteClusterCustomResource(group, version, plural, name)
                  .catch(() => {});
              }),
          );
        } catch {
          // Ignore list/cleanup errors
        }
      },
    },
    {
      id: 'cleanup-instance-types-cluster',
      name: 'Clean up cluster-scoped instance types',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          const k8sClient = ctx.k8sClient;
          const group = 'instancetype.kubevirt.io';
          const version = 'v1beta1';

          const clusterTestPrefixes = [
            'pw-cluster-instancetype-',
            'pw-standard-cluster-it-',
            'pw-high-perf-cluster-it-',
            'pw-test-cluster-instancetype-',
          ];

          const items = await k8sClient.listClusterCustomResources(
            group,
            version,
            'virtualmachineclusterinstancetypes',
          );

          await Promise.allSettled(
            items
              .filter((it) => {
                const name = it.metadata?.name;
                return name && clusterTestPrefixes.some((pfx) => name.startsWith(pfx));
              })
              .map((it) => {
                const name = it.metadata?.name;
                if (!name) return Promise.resolve();
                return k8sClient
                  .deleteClusterCustomResource(
                    group,
                    version,
                    'virtualmachineclusterinstancetypes',
                    name,
                  )
                  .catch(() => {});
              }),
          );
        } catch {
          // Ignore list errors
        }
      },
    },
    {
      id: 'restore-hco',
      name: 'Restore HyperConverged settings',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          const k8sClient = ctx.k8sClient;
          const namespace = 'openshift-cnv';
          const hcoName = 'kubevirt-hyperconverged';

          let hco: { spec?: Record<string, unknown> };
          try {
            hco = await k8sClient.getHyperConverged(hcoName, namespace);
          } catch (getError: unknown) {
            const err = getError as { statusCode?: number; message?: string };
            if (err.statusCode === 404 || err.message?.includes('404')) {
              logger.info('HCO CRD not found — CNV may not be installed. Skipping restoration.');
              return;
            }
            throw getError;
          }

          if (!hco?.spec) return;

          const patchOps: Array<{ op: string; path: string; value?: unknown }> = [];
          const spec = hco.spec as Record<string, unknown>;

          if (
            (spec.permittedHostDevices as Record<string, unknown>)?.passt &&
            (
              (spec.permittedHostDevices as Record<string, unknown>).passt as Record<
                string,
                unknown
              >
            )?.enabled === true
          ) {
            patchOps.push({
              op: 'replace',
              path: '/spec/permittedHostDevices/passt/enabled',
              value: false,
            });
          }

          if (spec.ksmConfiguration) {
            patchOps.push({ op: 'remove', path: '/spec/ksmConfiguration' });
          }

          if (patchOps.length > 0) {
            await k8sClient.patchHyperConverged(hcoName, namespace, patchOps);
            logger.success('✓ Restored hyperconverged settings to default state');
          }

          if (await k8sClient.isNativeVmTemplateFeatureGateEnabled(hcoName, namespace)) {
            await k8sClient.disableNativeVmTemplateFeatureGate(hcoName, namespace);
            logger.success('✓ Removed native VM template feature gate from HCO');
          }
        } catch (error: unknown) {
          const err = error as { statusCode?: number; message?: string };
          if (err.statusCode === 404 || err.message?.includes('404')) return;
          safeWarn('Failed to restore hyperconverged settings', error);
        }
      },
    },
    {
      id: 'restore-cnv-settings',
      name: 'Restore CNV global settings to defaults',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        if (!ctx.k8sClient) return;
        const k8sClient = ctx.k8sClient;
        const hcoName = 'kubevirt-hyperconverged';
        const hcoNamespace = 'openshift-cnv';

        try {
          const hco = await k8sClient
            .getHyperConverged(hcoName, hcoNamespace)
            .catch((err: unknown) => {
              const e = err as { statusCode?: number };
              if (e.statusCode === 404) return null;
              throw err;
            });

          if (hco?.spec) {
            const spec = hco.spec as Record<string, unknown>;
            const patchOps: Array<{ op: string; path: string; value?: unknown }> = [];

            if (spec['liveMigrationConfig']) {
              patchOps.push({ op: 'remove', path: '/spec/liveMigrationConfig' });
            }
            if (spec['higherWorkloadDensity']) {
              patchOps.push({ op: 'remove', path: '/spec/higherWorkloadDensity' });
            }
            if (patchOps.length > 0) {
              await k8sClient.patchHyperConverged(hcoName, hcoNamespace, patchOps);
              logger.success('✓ Restored HCO live migration and memory density settings');
            }
          }
        } catch (error: unknown) {
          safeWarn('Failed to restore HCO settings', error);
        }

        try {
          await k8sClient.patchConfigMap('kubevirt-ui-features', hcoNamespace, {
            hideYamlTab: 'false',
            disabledGuestSystemLogsAccess: 'false',
            hideCredentialsNonPrivileged: 'false',
            confirmVMActions: 'false',
          });
          logger.success('✓ Restored kubevirt-ui-features ConfigMap to defaults');
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          if (err.statusCode !== 404) {
            safeWarn('Failed to restore kubevirt-ui-features ConfigMap', error);
          }
        }
      },
    },
    {
      id: 'cleanup-test-namespaces',
      name: 'Delete test namespaces by prefix',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          const coreApi = ctx.k8sClient.getCoreV1Api();
          const namespaces = await coreApi.listNamespace();
          if (!namespaces.items?.length) return;

          const matching = namespaces.items.filter((ns) => {
            const name = ns.metadata?.name;
            return name && name.startsWith('pw-') && name !== ctx.testNamespace;
          });
          if (matching.length === 0) return;

          logger.info(`Cleaning up ${matching.length} test namespace(s)...`);
          await Promise.allSettled(
            matching.map((ns) => {
              const name = ns.metadata?.name;
              if (!name) return Promise.resolve();
              return coreApi
                .deleteNamespace({ name })
                .catch((e: unknown) => safeWarn(`⚠️ Failed to delete namespace ${name}`, e));
            }),
          );
          logger.success('Completed test namespace cleanup');
        } catch (error: unknown) {
          safeWarn('Failed to list namespaces', error);
        }
      },
    },
    {
      id: 'cleanup-nonpriv-user',
      name: 'Remove non-priv test user and all associated cluster resources',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: () => EnvVariables.isNonPrivUser,
      run: async (ctx) => {
        if (!ctx.k8sClient) return;
        const username = EnvVariables.testUsername;
        logger.info(`🧹 Removing non-priv user "${username}" and all associated resources...`);
        await removeNonPrivUser(
          ctx.k8sClient,
          username,
          ctx.testNamespace,
          EnvVariables.cnvNamespace,
        );
        logger.success(`✓ Non-priv user "${username}" fully cleaned up`);
      },
    },
    {
      id: 'cluster-janitor-teardown',
      name: 'Run ClusterJanitor final sweep',
      scope: TeardownScope.CLUSTER,
      onError: 'skip',
      guard: (ctx) => EnvVariables.isClusterJanitorEnabled && ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        if (!ctx.k8sClient) return;
        try {
          const janitor = new ClusterJanitor(ctx.k8sClient, {
            staleAgeMs: 0,
            excludeNamespaces: [ctx.testNamespace],
          });
          await janitor.sweepOnce();
        } catch (error: unknown) {
          safeWarn('ClusterJanitor teardown sweep failed', error);
        }
      },
    },
  ];
}
