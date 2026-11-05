import * as fs from 'fs';

import {
  deleteDefaultNamespaceE2eVms,
  deleteLabeledE2eNamespaces,
  deletePwMigrationPolicies,
} from '@/utils/cluster-oc';
import { logger } from '@/utils/logger';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

function safeWarn(message: string, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err);
  logger.warn(`${message}: ${detail}`);
}

function hasKubeconfigOnDisk(ctx: { kubeConfigPath?: string }): boolean {
  const path = ctx.kubeConfigPath;
  return Boolean(path && fs.existsSync(path));
}

/**
 * Privileged HC sets skipOcInvocations so tests use console API only — teardown still
 * needs kubeconfig-based cluster cleanup when a kubeconfig file is present.
 */
export function getClusterTeardownRules(): TeardownRule[] {
  return [
    {
      id: 'cleanup-migration-policies',
      name: 'Clean up cluster-scoped migration policies',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources && hasKubeconfigOnDisk(ctx),
      run: async (ctx) => {
        try {
          deletePwMigrationPolicies(ctx.kubeConfigPath);
        } catch (error: unknown) {
          safeWarn('Failed to clean up migration policies', error);
        }
      },
    },
    {
      id: 'cleanup-test-namespaces',
      name: 'Delete test namespaces by label',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources && hasKubeconfigOnDisk(ctx),
      run: async (ctx) => {
        try {
          logger.info('🧹 Deleting namespaces labeled kubevirt-plugin-e2e=true...');
          deleteLabeledE2eNamespaces(ctx.kubeConfigPath);
        } catch (error: unknown) {
          safeWarn('Failed to delete test namespaces', error);
        }
      },
    },
    {
      id: 'cleanup-default-e2e-vms',
      name: 'Delete orphan e2e VMs left in default namespace',
      scope: TeardownScope.CLUSTER,
      onError: 'warn',
      guard: (ctx) => ctx.shouldCleanupClusterResources && hasKubeconfigOnDisk(ctx),
      run: async (ctx) => {
        try {
          logger.info('🧹 Sweeping Playwright orphan VMs from default namespace...');
          deleteDefaultNamespaceE2eVms(ctx.kubeConfigPath);
        } catch (error: unknown) {
          safeWarn('Failed to clean default-namespace e2e VMs', error);
        }
      },
    },
  ];
}
