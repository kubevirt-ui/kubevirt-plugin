import * as fs from 'fs';

import { deleteLabeledE2eNamespaces, deletePwMigrationPolicies } from '@/utils/cluster-oc';
import { EnvVariables } from '@/utils/env-variables';
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

export function getClusterTeardownRules(): TeardownRule[] {
  return [
    {
      guard: (ctx) =>
        ctx.shouldCleanupClusterResources &&
        !EnvVariables.skipOcInvocations &&
        hasKubeconfigOnDisk(ctx),
      id: 'cleanup-migration-policies',
      name: 'Clean up cluster-scoped migration policies',
      onError: 'warn',
      run: async (ctx) => {
        try {
          deletePwMigrationPolicies(ctx.kubeConfigPath);
        } catch (error: unknown) {
          safeWarn('Failed to clean up migration policies', error);
        }
      },
      scope: TeardownScope.CLUSTER,
    },
    {
      guard: (ctx) =>
        ctx.shouldCleanupClusterResources &&
        !EnvVariables.skipOcInvocations &&
        hasKubeconfigOnDisk(ctx),
      id: 'cleanup-test-namespaces',
      name: 'Delete test namespaces by label',
      onError: 'warn',
      run: async (ctx) => {
        try {
          logger.info('🧹 Deleting namespaces labeled kubevirt-plugin-e2e=true...');
          deleteLabeledE2eNamespaces(ctx.kubeConfigPath);
        } catch (error: unknown) {
          safeWarn('Failed to delete test namespaces', error);
        }
      },
      scope: TeardownScope.CLUSTER,
    },
  ];
}
