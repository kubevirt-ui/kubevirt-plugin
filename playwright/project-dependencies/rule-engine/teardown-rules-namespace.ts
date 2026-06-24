import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { logger } from '@/utils/logger';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

function safeWarn(message: string, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err);
  logger.warn(`${message}: ${detail}`);
}

export function getNamespaceTeardownRules(): TeardownRule[] {
  return [
    {
      id: 'cleanup-vms',
      name: 'Clean up test VMs (delete protection handling)',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping test VM cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;
          const group = 'kubevirt.io';
          const version = 'v1';
          const plural = 'virtualmachines';

          const testPrefixes = [
            'pw-vm-source-',
            'pw-vm-cloned-',
            'pw-vm-it-folder-',
            'pw-vm-template-folder-',
            'pw-vm-it-',
            'pw-vm-template-',
            'pw-vm-gating-',
            'pw-vm-test-',
            'pw-vm-catalog-',
            'pw-vm-tier1-',
            'pw-vm-tier2-',
            'pw-vm-',
          ];

          const vms = await k8sClient.listCustomResources(group, version, testNamespace, plural);

          if (vms.length === 0) {
            return;
          }

          const matchingVMs = vms.filter(
            (vm: { metadata?: { labels?: Record<string, string>; name?: string } }) => {
              const name = vm.metadata?.name;
              return name && testPrefixes.some((prefix) => name.startsWith(prefix));
            },
          );

          if (matchingVMs.length === 0) {
            return;
          }

          logger.info(`Cleaning up ${matchingVMs.length} test VM(s) in ${testNamespace}...`);

          for (const vm of matchingVMs) {
            const name = vm.metadata?.name;
            if (!name) continue;
            try {
              const labels = vm.metadata?.labels || {};
              const deleteProtectionLabel = labels['kubevirt.io/vm-delete-protection'];
              const hasDeleteProtection =
                deleteProtectionLabel === 'enabled' || deleteProtectionLabel === 'true';

              logger.info(
                `  Processing VM: ${name} (delete-protection: ${
                  deleteProtectionLabel || 'not set'
                })`,
              );

              if (hasDeleteProtection) {
                logger.info(`⚠️ VM ${name} has delete protection - removing label...`);
                try {
                  await k8sClient.removeVmDeleteProtection(name, testNamespace);
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                  logger.info(`✓ Delete protection removed for VM: ${name}`);
                } catch (disableError: unknown) {
                  safeWarn(`⚠️ Failed to remove delete protection for ${name}`, disableError);
                }
              }

              await k8sClient.deleteCustomResource(group, version, testNamespace, plural, name);
              logger.info(`✓ Deleted VM: ${name}`);
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (
                errorMessage.includes('forbidden') ||
                errorMessage.includes('delete-protection')
              ) {
                logger.error(
                  `❌ VM ${name} still has delete protection enabled - manual cleanup required`,
                );
              } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                logger.info(`✓ VM ${name} already deleted`);
              } else {
                logger.warn(`⚠️ Failed to delete VM ${name}: ${errorMessage}`);
              }
            }
          }
          logger.success(`Completed VM cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list VMs in ${ctx.testNamespace}`, error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
    {
      id: 'cleanup-templates',
      name: 'Clean up namespaced templates',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping namespaced template cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;
          const group = 'template.openshift.io';
          const version = 'v1';

          const namespacedTestPrefixes = [
            'pw-default-template-',
            'pw-template-',
            'pw-test-template-',
            'pw-gating-template-',
            'default-template-',
            'test-template-',
          ];

          const namespacedTemplates = await k8sClient.listCustomResources(
            group,
            version,
            testNamespace,
            'templates',
          );

          if (namespacedTemplates.length === 0) {
            logger.info(`No namespaced templates found in ${testNamespace}`);
            return;
          }

          const matchingTemplates = namespacedTemplates.filter((template: KubernetesResource) => {
            const name = template.metadata?.name;
            return name && namespacedTestPrefixes.some((prefix) => name.startsWith(prefix));
          });

          if (matchingTemplates.length === 0) {
            logger.info(`No test templates to clean up in ${testNamespace}`);
            return;
          }

          logger.info(`Cleaning up ${matchingTemplates.length} template(s) in ${testNamespace}...`);

          const deletionPromises = matchingTemplates.map((template: KubernetesResource) => {
            const name = template.metadata?.name;
            if (!name) return Promise.resolve();
            return k8sClient
              .deleteCustomResource(group, version, testNamespace, 'templates', name)
              .catch((error: unknown) => {
                safeWarn(`⚠️ Failed to delete template ${name}`, error);
              });
          });

          await Promise.allSettled(deletionPromises);
          logger.success(`Completed template cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list templates in ${ctx.testNamespace}`, error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
    {
      id: 'cleanup-instance-types-ns',
      name: 'Clean up namespaced instance types',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping namespaced instance type cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;
          const group = 'instancetype.kubevirt.io';
          const version = 'v1beta1';

          const namespacedTestPrefixes = [
            'pw-instancetype-',
            'pw-user-instancetype-',
            'pw-smoke-instancetype-',
            'pw-minimal-instancetype-',
            'pw-max-instancetype-',
            'pw-db-instancetype-',
            'pw-mi-instancetype-',
            'pw-test-instancetype-',
            'user-instancetype-',
            'smoke-instancetype-',
            'minimal-instancetype-',
            'max-instancetype-',
            'db-instancetype-',
            'mi-instancetype-',
            'test-instancetype-',
          ];

          const namespacedInstanceTypes = await k8sClient.listCustomResources(
            group,
            version,
            testNamespace,
            'virtualmachineinstancetypes',
          );

          if (namespacedInstanceTypes.length === 0) {
            logger.info(`No namespaced instance types found in ${testNamespace}`);
            return;
          }

          const matchingInstanceTypes = namespacedInstanceTypes.filter(
            (instanceType: KubernetesResource) => {
              const name = instanceType.metadata?.name;
              return name && namespacedTestPrefixes.some((prefix) => name.startsWith(prefix));
            },
          );

          if (matchingInstanceTypes.length === 0) {
            logger.info(`No test instance types to clean up in ${testNamespace}`);
            return;
          }

          logger.info(
            `Cleaning up ${matchingInstanceTypes.length} instance type(s) in ${testNamespace}...`,
          );

          const deletionPromises = matchingInstanceTypes.map((instanceType: KubernetesResource) => {
            const name = instanceType.metadata?.name;
            if (!name) return Promise.resolve();
            return k8sClient
              .deleteCustomResource(
                group,
                version,
                testNamespace,
                'virtualmachineinstancetypes',
                name,
              )
              .then(() => {
                logger.info(`✓ Deleted instance type: ${name}`);
              })
              .catch((error: unknown) => {
                safeWarn(`⚠️ Failed to delete instance type ${name}`, error);
              });
          });

          await Promise.allSettled(deletionPromises);
          logger.success(`Completed instance type cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list instance types in ${ctx.testNamespace}`, error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
    {
      id: 'cleanup-migration-plans',
      name: 'Clean up migration plans',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping migration plan cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;
          const group = 'migration.openshift.io';
          const version = 'v1alpha1';
          const plural = 'migplans';
          const namespacesToClean = [testNamespace, 'openshift-migration'];
          const testPrefixes = ['migplan-'];

          for (const namespace of namespacesToClean) {
            try {
              const migrationPlans = await k8sClient.listCustomResources(
                group,
                version,
                namespace,
                plural,
              );

              if (migrationPlans.length === 0) {
                continue;
              }

              const matchingPlans = migrationPlans.filter((plan: KubernetesResource) => {
                const name = plan.metadata?.name;
                return name && testPrefixes.some((prefix) => name.startsWith(prefix));
              });

              if (matchingPlans.length === 0) {
                continue;
              }

              logger.info(
                `Cleaning up ${matchingPlans.length} migration plan(s) in ${namespace}...`,
              );

              const deletionPromises = matchingPlans.map((plan: KubernetesResource) => {
                const name = plan.metadata?.name;
                if (!name) return Promise.resolve();
                return k8sClient
                  .deleteCustomResource(group, version, namespace, plural, name)
                  .then(() => {
                    logger.info(`✓ Deleted migration plan: ${name}`);
                  })
                  .catch((error: unknown) => {
                    safeWarn(`⚠️ Failed to delete migration plan ${name}`, error);
                  });
              });

              await Promise.allSettled(deletionPromises);
              logger.success(`Completed migration plan cleanup in ${namespace}`);
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              if (message.includes('404')) {
                logger.info(
                  'MigPlan CRD not found. Assuming MTC is not installed. Skipping cleanup.',
                );
                return;
              }
            }
          }
        } catch (error: unknown) {
          safeWarn('Migration plan cleanup failed', error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
    {
      id: 'cleanup-bootable-volumes',
      name: 'Clean up bootable volumes (DataSources)',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping bootable volume cleanup');
            return;
          }
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;
          const group = 'cdi.kubevirt.io';
          const version = 'v1beta1';
          const plural = 'datasources';

          const testPrefixes = [
            'pw-vol-',
            'pw-volume-',
            'pw-vol-cirros-',
            'pw-datavolume-',
            'pw-dv-',
            'pw-bootable-',
            'pw-boot-vol-',
            'pw-disk-',
            'pw-',
          ];

          const dataSources = await k8sClient.listCustomResources(
            group,
            version,
            testNamespace,
            plural,
          );

          if (dataSources.length === 0) {
            return;
          }

          const matchingDataSources = dataSources.filter((ds: { metadata?: { name?: string } }) => {
            const name = ds.metadata?.name;
            return name && testPrefixes.some((prefix) => name.startsWith(prefix));
          });

          if (matchingDataSources.length === 0) {
            return;
          }

          logger.info(
            `Cleaning up ${matchingDataSources.length} bootable volume(s) in ${testNamespace}...`,
          );

          const deletionPromises = matchingDataSources.map(
            (ds: { metadata?: { name?: string } }) => {
              const name = ds.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteCustomResource(group, version, testNamespace, plural, name)
                .then(() => {
                  logger.info(`✓ Deleted bootable volume: ${name}`);
                })
                .catch((error: { message?: string; statusCode?: number } | unknown) => {
                  const err = error as { message?: string; statusCode?: number };
                  if (err.statusCode === 404) {
                    logger.info(`✓ Bootable volume ${name} already deleted`);
                  } else {
                    safeWarn(`⚠️ Failed to delete bootable volume ${name}`, error);
                  }
                });
            },
          );

          await Promise.allSettled(deletionPromises);
          logger.success(`Completed bootable volume cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list bootable volumes in ${ctx.testNamespace}`, error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
    {
      id: 'cleanup-namespace-resources',
      name: 'Clean up remaining test namespace resources',
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) {
            logger.warn('⚠️ No Kubernetes client — skipping namespace resource cleanup');
            return;
          }
          await ctx.k8sClient.cleanupTestNamespace(ctx.testNamespace);
        } catch (error: unknown) {
          safeWarn(`cleanupTestNamespace failed for ${ctx.testNamespace}`, error);
        }
      },
      scope: TeardownScope.NAMESPACE,
    },
  ];
}
