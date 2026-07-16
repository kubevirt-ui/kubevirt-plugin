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
      id: 'remove-vm-delete-protection',
      name: 'Remove delete-protection labels from test VMs',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.apiClient) return;
        const apiClient = ctx.apiClient;
        const ns = ctx.testNamespace;

        try {
          const { items: vms } = await apiClient.listResourcesByKind('vm', ns);
          const protectedVms = vms.filter((vm) => {
            const labels = (vm.metadata as Record<string, unknown>)?.labels as
              | Record<string, string>
              | undefined;
            const val = labels?.['kubevirt.io/vm-delete-protection'];
            return val === 'enabled' || val === 'true';
          });

          if (protectedVms.length === 0) return;

          logger.info(`Removing delete-protection from ${protectedVms.length} VM(s)...`);
          for (const vm of protectedVms) {
            const name = vm.metadata?.name;
            if (!name) continue;
            try {
              await apiClient.patchResourceByKind(
                'vm',
                name,
                {
                  metadata: { labels: { 'kubevirt.io/delete-protection': null } },
                  spec: {
                    template: {
                      metadata: { labels: { 'kubevirt.io/delete-protection': null } },
                    },
                  },
                },
                ns,
                'merge',
              );
            } catch (err: unknown) {
              safeWarn(`Failed to remove delete-protection from VM ${name}`, err);
            }
          }
        } catch (err: unknown) {
          safeWarn('Failed to list VMs for delete-protection removal', err);
        }
      },
    },
    {
      id: 'cleanup-namespace-resources',
      name: 'Bulk-delete all test namespace resources',
      scope: TeardownScope.NAMESPACE,
      onError: 'warn',
      run: async (ctx) => {
        if (!ctx.apiClient) return;
        try {
          await ctx.apiClient.cleanupTestNamespace(ctx.testNamespace);
        } catch (error: unknown) {
          safeWarn(`cleanupTestNamespace failed for ${ctx.testNamespace}`, error);
        }
      },
    },
  ];
}
