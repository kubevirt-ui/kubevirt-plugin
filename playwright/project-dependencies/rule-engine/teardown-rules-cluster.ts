import type { KubernetesResource } from '@/data-models/kubernetes-types';
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
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      id: 'cleanup-migration-policies',
      name: 'Clean up cluster-scoped migration policies',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping migration policy cleanup');
            return;
          }
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
            'test-migration-policy-',
            'smoke-migration-policy-',
            'minimal-migration-policy-',
            'auto-converge-policy-',
            'bandwidth-policy-',
            'selector-policy-',
            'edge-case-policy-',
            'existence-check-policy-',
            'complex-config-policy-',
            'test-form-policy-',
            'smoke-form-policy-',
            'edge-case-form-policy-',
            'minimal-form-policy-',
            'form-existence-check-',
          ];

          const migrationPolicies = await k8sClient.listClusterCustomResources(
            group,
            version,
            plural,
          );

          const deletionPromises = migrationPolicies
            .filter((policy: KubernetesResource) => {
              const name = policy.metadata?.name;
              return name && testPrefixes.some((prefix) => name.startsWith(prefix));
            })
            .map((policy: KubernetesResource) => {
              const name = policy.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteClusterCustomResource(group, version, plural, name)
                .catch(() => {
                  // Ignore deletion errors silently
                });
            });

          await Promise.allSettled(deletionPromises);
        } catch {
          // Ignore list/cleanup errors silently
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      id: 'cleanup-instance-types-cluster',
      name: 'Clean up cluster-scoped instance types',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping cluster instance type cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const group = 'instancetype.kubevirt.io';
          const version = 'v1beta1';

          const clusterTestPrefixes = [
            'pw-cluster-instancetype-',
            'pw-standard-cluster-it-',
            'pw-high-perf-cluster-it-',
            'pw-test-cluster-instancetype-',
            'cluster-instancetype-',
            'standard-cluster-it-',
            'high-perf-cluster-it-',
            'test-cluster-instancetype-',
          ];

          const clusterInstanceTypes = await k8sClient.listClusterCustomResources(
            group,
            version,
            'virtualmachineclusterinstancetypes',
          );

          const deletionPromises = clusterInstanceTypes
            .filter((instanceType: KubernetesResource) => {
              const name = instanceType.metadata?.name;
              return name && clusterTestPrefixes.some((prefix) => name.startsWith(prefix));
            })
            .map((instanceType: KubernetesResource) => {
              const name = instanceType.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteClusterCustomResource(
                  group,
                  version,
                  'virtualmachineclusterinstancetypes',
                  name,
                )
                .catch(() => {
                  // Ignore deletion errors
                });
            });

          await Promise.allSettled(deletionPromises);
        } catch {
          // Ignore list errors
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      id: 'restore-hco',
      name: 'Restore HyperConverged settings',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping HCO restore');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const namespace = 'openshift-cnv';
          const hcoName = 'kubevirt-hyperconverged';

          let hco: { spec?: Record<string, unknown> };
          try {
            hco = await k8sClient.getHyperConverged(hcoName, namespace);
          } catch (getError: unknown) {
            const err = getError as { message?: string; statusCode?: number };
            if (err.statusCode === 404 || err.message?.includes('404')) {
              logger.info(
                'HyperConverged CRD not found - CNV may not be installed. Skipping restoration.',
              );
              return;
            }
            throw getError;
          }

          if (!hco || !hco.spec) {
            logger.info('HCO resource not found or has no spec - skipping restoration');
            return;
          }

          const patchOps: Array<{ op: string; path: string; value?: unknown }> = [];

          const spec = hco.spec as {
            ksmConfiguration?: unknown;
            permittedHostDevices?: { passt?: { enabled?: boolean }; scsi?: { enabled?: boolean } };
          };

          if (spec.permittedHostDevices?.passt?.enabled === true) {
            patchOps.push({
              op: 'replace',
              path: '/spec/permittedHostDevices/passt/enabled',
              value: false,
            });
            logger.info('Restoring Passt binding setting to disabled');
          }

          if (spec.permittedHostDevices?.scsi?.enabled === true) {
            patchOps.push({
              op: 'replace',
              path: '/spec/permittedHostDevices/scsi/enabled',
              value: false,
            });
            logger.info('Restoring SCSI persistent reservation setting to disabled');
          }

          if (spec.ksmConfiguration) {
            patchOps.push({
              op: 'remove',
              path: '/spec/ksmConfiguration',
            });
            logger.info('Restoring KSM configuration (removing ksmConfiguration)');
          }

          if (patchOps.length > 0) {
            await k8sClient.patchHyperConverged(hcoName, namespace, patchOps);
            logger.success('✓ Restored hyperconverged settings to default state');
          } else {
            logger.info('No hyperconverged settings to restore');
          }
        } catch (error: unknown) {
          const err = error as { message?: string; statusCode?: number };
          if (err.statusCode === 404 || err.message?.includes('404')) {
            logger.info('HyperConverged resource not available - skipping restoration.');
            return;
          }
          safeWarn('Failed to restore hyperconverged settings', error);
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      id: 'restore-cnv-settings',
      name: 'Restore CNV global settings to defaults',
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          logger.warn('⚠️ No Kubernetes client — skipping CNV settings restore');
          return;
        }
        const k8sClient = ctx.k8sClient;
        const hcoName = 'kubevirt-hyperconverged';
        const hcoNamespace = 'openshift-cnv';

        // ── HCO: live migration limits and memory density ─────────────────────
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
              logger.info('Restoring liveMigrationConfig to cluster default');
            }

            if (spec['higherWorkloadDensity']) {
              patchOps.push({ op: 'remove', path: '/spec/higherWorkloadDensity' });
              logger.info('Restoring higherWorkloadDensity (memory density) to cluster default');
            }

            if (patchOps.length > 0) {
              await k8sClient.patchHyperConverged(hcoName, hcoNamespace, patchOps);
              logger.success('✓ Restored HCO live migration and memory density settings');
            }
          }
        } catch (error: unknown) {
          safeWarn('Failed to restore HCO live migration / memory density settings', error);
        }

        // ── kubevirt-ui-features ConfigMap: all settings-test-modified keys ─────
        try {
          await k8sClient.patchConfigMap('kubevirt-ui-features', hcoNamespace, {
            confirmVMActions: 'false',
            disabledGuestSystemLogsAccess: 'false',
            hideCredentialsNonPrivileged: 'false',
            hideYamlTab: 'false',
          });
          logger.success(
            '✓ Restored kubevirt-ui-features ConfigMap (hideYamlTab, guestSystemLog, hideCredentials, confirmVMActions → defaults)',
          );
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          if (err.statusCode === 404) {
            logger.info('kubevirt-ui-features ConfigMap not found — skipping');
          } else {
            safeWarn('Failed to restore kubevirt-ui-features ConfigMap', error);
          }
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      id: 'cleanup-test-namespaces',
      name: 'Delete test namespaces by prefix',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping test namespace deletion');
            return;
          }
          const k8sClient = ctx.k8sClient;

          const namespaces = await k8sClient.getCoreV1Api().listNamespace();

          if (!namespaces.items || namespaces.items.length === 0) {
            return;
          }

          const matchingNamespaces = namespaces.items.filter((ns) => {
            const name = ns.metadata?.name;
            return name && name.startsWith('pw-') && name !== ctx.testNamespace;
          });

          if (matchingNamespaces.length === 0) {
            logger.info('No test namespaces to clean up');
            return;
          }

          logger.info(`Cleaning up ${matchingNamespaces.length} test namespace(s)...`);

          const deletionPromises = matchingNamespaces.map((ns) => {
            const name = ns.metadata?.name;
            if (!name) return Promise.resolve();
            return k8sClient
              .getCoreV1Api()
              .deleteNamespace({ name })
              .then(() => {
                logger.info(`✓ Deleted test namespace: ${name}`);
              })
              .catch((error: unknown) => {
                const err = error as { message?: string; statusCode?: number };
                if (err.statusCode === 404) {
                  logger.info(`✓ Namespace ${name} already deleted`);
                } else {
                  safeWarn(`⚠️ Failed to delete namespace ${name}`, error);
                }
              });
          });

          await Promise.allSettled(deletionPromises);
          logger.success('Completed test namespace cleanup');
        } catch (error: unknown) {
          safeWarn('Failed to list namespaces', error);
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: () => EnvVariables.isNonPrivUser,
      id: 'cleanup-nonpriv-user',
      name: 'Remove non-priv test user and all associated cluster resources',
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          logger.warn('⚠️ No Kubernetes client — skipping non-priv user cleanup');
          return;
        }
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
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) => EnvVariables.isClusterJanitorEnabled && ctx.shouldCleanupClusterResources,
      id: 'cluster-janitor-teardown',
      name: 'Run ClusterJanitor final sweep',
      onError: 'skip',
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          logger.warn('⚠️ No Kubernetes client — skipping ClusterJanitor teardown sweep');
          return;
        }
        try {
          const janitor = new ClusterJanitor(ctx.k8sClient, {
            excludeNamespaces: [ctx.testNamespace],
            staleAgeMs: 0,
          });
          await janitor.sweepOnce();
        } catch (error: unknown) {
          safeWarn('ClusterJanitor teardown sweep failed', error);
        }
      },
      scope: TeardownScope.CLUSTER,
    },
  ];
}
