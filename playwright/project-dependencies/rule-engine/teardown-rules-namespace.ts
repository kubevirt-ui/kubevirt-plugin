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
      scope: TeardownScope.NAMESPACE,
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
          if (vms.length === 0) return;

          const matchingVMs = vms.filter(
            (vm: { metadata?: { name?: string; labels?: Record<string, string> } }) => {
              const name = vm.metadata?.name;
              return name && testPrefixes.some((prefix) => name.startsWith(prefix));
            },
          );
          if (matchingVMs.length === 0) return;

          logger.info(`Cleaning up ${matchingVMs.length} test VM(s) in ${testNamespace}...`);

          for (const vm of matchingVMs) {
            const name = vm.metadata?.name;
            if (!name) continue;
            try {
              const labels = vm.metadata?.labels || {};
              const deleteProtectionLabel = labels['kubevirt.io/vm-delete-protection'];
              const hasDeleteProtection =
                deleteProtectionLabel === 'enabled' || deleteProtectionLabel === 'true';

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
              if (errorMessage.includes('404') || errorMessage.includes('not found')) {
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
    },
    {
      id: 'cleanup-templates',
      name: 'Clean up namespaced templates',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          const k8sClient = ctx.k8sClient;
          const testNamespace = ctx.testNamespace;

          const namespacedTestPrefixes = [
            'pw-default-template-',
            'pw-template-',
            'pw-test-template-',
            'pw-gating-template-',
            'default-template-',
            'test-template-',
          ];

          const namespacedTemplates = await k8sClient.listCustomResources(
            'template.openshift.io',
            'v1',
            testNamespace,
            'templates',
          );
          if (namespacedTemplates.length === 0) return;

          const matchingTemplates = namespacedTemplates.filter((template) => {
            const name = template.metadata?.name;
            return name && namespacedTestPrefixes.some((prefix) => name.startsWith(prefix));
          });
          if (matchingTemplates.length === 0) return;

          logger.info(`Cleaning up ${matchingTemplates.length} template(s) in ${testNamespace}...`);

          const deletionPromises = matchingTemplates.map((template) => {
            const name = template.metadata?.name;
            if (!name) return Promise.resolve();
            return k8sClient
              .deleteCustomResource('template.openshift.io', 'v1', testNamespace, 'templates', name)
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
    },
    {
      id: 'cleanup-instance-types-ns',
      name: 'Clean up namespaced instance types',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
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
          ];

          const items = await k8sClient.listCustomResources(
            group,
            version,
            testNamespace,
            'virtualmachineinstancetypes',
          );
          if (items.length === 0) return;

          const matching = items.filter((it) => {
            const name = it.metadata?.name;
            return name && namespacedTestPrefixes.some((prefix) => name.startsWith(prefix));
          });
          if (matching.length === 0) return;

          logger.info(`Cleaning up ${matching.length} instance type(s) in ${testNamespace}...`);

          await Promise.allSettled(
            matching.map((it) => {
              const name = it.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteCustomResource(
                  group,
                  version,
                  testNamespace,
                  'virtualmachineinstancetypes',
                  name,
                )
                .catch((e: unknown) => safeWarn(`⚠️ Failed to delete instance type ${name}`, e));
            }),
          );
          logger.success(`Completed instance type cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list instance types in ${ctx.testNamespace}`, error);
        }
      },
    },
    {
      id: 'cleanup-bootable-volumes',
      name: 'Clean up bootable volumes (DataSources)',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
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
          if (dataSources.length === 0) return;

          const matching = dataSources.filter((ds: { metadata?: { name?: string } }) => {
            const name = ds.metadata?.name;
            return name && testPrefixes.some((prefix) => name.startsWith(prefix));
          });
          if (matching.length === 0) return;

          logger.info(`Cleaning up ${matching.length} bootable volume(s) in ${testNamespace}...`);

          await Promise.allSettled(
            matching.map((ds: { metadata?: { name?: string } }) => {
              const name = ds.metadata?.name;
              if (!name) return Promise.resolve();
              return k8sClient
                .deleteCustomResource(group, version, testNamespace, plural, name)
                .catch((e: unknown) => safeWarn(`⚠️ Failed to delete bootable volume ${name}`, e));
            }),
          );
          logger.success(`Completed bootable volume cleanup in ${testNamespace}`);
        } catch (error: unknown) {
          safeWarn(`Failed to list bootable volumes in ${ctx.testNamespace}`, error);
        }
      },
    },
    {
      id: 'cleanup-namespace-resources',
      name: 'Clean up remaining test namespace resources',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        try {
          if (!ctx.k8sClient) return;
          await ctx.k8sClient.cleanupTestNamespace(ctx.testNamespace);
        } catch (error: unknown) {
          safeWarn(`cleanupTestNamespace failed for ${ctx.testNamespace}`, error);
        }
      },
    },
  ];
}
