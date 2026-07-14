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
            .filter((policy) => {
              const name = policy.metadata?.name;
              return name && testPrefixes.some((prefix) => name.startsWith(prefix));
            })
            .map((policy) => {
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
    },
    {
      id: 'cleanup-nncp',
      name: 'Clean up NodeNetworkConfigurationPolicies',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping NNCP cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const group = 'nmstate.io';
          const version = 'v1';
          const plural = 'nodenetworkconfigurationpolicies';

          const testPrefixes = [
            'auto-test-',
            'test-yaml-',
            'physical-network-',
            'pw-nncp-',
            'pw-test-nncp-',
            'pw-form-nncp-',
            'pw-yaml-nncp-',
          ];
          try {
            const nncps = await k8sClient.listClusterCustomResources(group, version, plural);

            const matchingNNCPs = nncps.filter((nncp) => {
              const name = nncp.metadata?.name;
              if (!name) return false;
              return testPrefixes.some((prefix) => name.startsWith(prefix));
            });

            if (matchingNNCPs.length === 0) {
              logger.info('No test NNCPs to clean up');
              return;
            }

            logger.info(`Cleaning up ${matchingNNCPs.length} NNCP(s)...`);

            const deletionPromises = matchingNNCPs.map((nncp) => {
              const name = nncp.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteClusterCustomResource(group, version, plural, name)
                .then(() => {
                  logger.info(`✓ Deleted NNCP: ${name}`);
                })
                .catch((error: unknown) => {
                  const err = error as { statusCode?: number; message?: string };
                  if (err.statusCode === 404) {
                    logger.info(`✓ NNCP ${name} already deleted`);
                  } else {
                    safeWarn(`⚠️ Failed to delete NNCP ${name}`, error);
                  }
                });
            });

            await Promise.allSettled(deletionPromises);
            logger.success('Completed NNCP cleanup');
          } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            if (err.statusCode === 404 || err.message?.includes('404')) {
              logger.info(
                'NodeNetworkConfigurationPolicy CRD not found - nmstate may not be installed. Skipping cleanup.',
              );
              return;
            }
            safeWarn('Failed to list NNCPs', error);
          }
        } catch (error: unknown) {
          safeWarn('NNCP cleanup failed', error);
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
            .filter((instanceType) => {
              const name = instanceType.metadata?.name;
              return name && clusterTestPrefixes.some((prefix) => name.startsWith(prefix));
            })
            .map((instanceType) => {
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
    },
    {
      id: 'restore-hco',
      name: 'Restore HyperConverged settings',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources && !EnvVariables.isHcE2e,
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
            const err = getError as { statusCode?: number; message?: string };
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
            permittedHostDevices?: { passt?: { enabled?: boolean }; scsi?: { enabled?: boolean } };
            ksmConfiguration?: unknown;
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

          if (await k8sClient.isNativeVmTemplateFeatureGateEnabled(hcoName, namespace)) {
            await k8sClient.disableNativeVmTemplateFeatureGate(hcoName, namespace);
            logger.success('✓ Removed native VM template feature gate from HCO');
          }
        } catch (error: unknown) {
          const err = error as { statusCode?: number; message?: string };
          if (err.statusCode === 404 || err.message?.includes('404')) {
            logger.info('HyperConverged resource not available - skipping restoration.');
            return;
          }
          safeWarn('Failed to restore hyperconverged settings', error);
        }
      },
    },
    {
      id: 'restore-cnv-settings',
      name: 'Restore CNV global settings to defaults',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources && !EnvVariables.isHcE2e,
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
            hideYamlTab: 'false',
            disabledGuestSystemLogsAccess: 'false',
            hideCredentialsNonPrivileged: 'false',
            confirmVMActions: 'false',
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
    },
    {
      id: 'cleanup-test-namespaces',
      name: 'Delete test namespaces by prefix',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources,
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

          const basePrefix = EnvVariables.testNamespace;
          const matchingNamespaces = namespaces.items.filter((ns) => {
            const name = ns.metadata?.name;
            if (!name || name === ctx.testNamespace) return false;
            return name === basePrefix || name.startsWith(`${basePrefix}-`);
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
                const err = error as { statusCode?: number; message?: string };
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
    },
    {
      id: 'cleanup-nonpriv-user',
      name: 'Remove non-priv test user and all associated cluster resources',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: () => EnvVariables.isNonPrivUser,
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
    },
    {
      id: 'cluster-janitor-teardown',
      name: 'Run ClusterJanitor final sweep',
      scope: TeardownScope.CLUSTER,
      onError: 'skip',
      guard: (ctx) => EnvVariables.isClusterJanitorEnabled && ctx.shouldCleanupClusterResources,
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          logger.warn('⚠️ No Kubernetes client — skipping ClusterJanitor teardown sweep');
          return;
        }
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
