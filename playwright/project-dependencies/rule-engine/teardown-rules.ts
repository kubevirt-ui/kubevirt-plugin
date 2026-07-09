import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export function getTeardownRules(): TeardownRule[] {
  return [
    {
      id: 'cleanup-namespace',
      name: 'Delete test namespace',
      onError: 'warn',
      scope: TeardownScope.NAMESPACE,
      run: async (ctx) => {
        if (!ctx.k8sClient) {
          logger.warn('⚠️ No Kubernetes client — skipping namespace cleanup');
          return;
        }
        logger.info(`🗑️ Deleting test namespace: ${ctx.testNamespace}...`);
        await ctx.k8sClient.cleanupTestNamespace(ctx.testNamespace);
        logger.success(`✓ Namespace ${ctx.testNamespace} deleted`);
      },
    },
    {
      guard: () => !EnvVariables.isDebugMode,
      id: 'cleanup-kubeconfig',
      name: 'Delete kubeconfig file',
      onError: 'skip',
      scope: TeardownScope.FILES,
      run: async (ctx) => {
        try {
          if (!ctx.kubeConfigPath || !fs.existsSync(ctx.kubeConfigPath)) return;
          const workspaceDir = path.join(PROJECT_ROOT, '.kubeconfigs');
          const resolved = path.resolve(ctx.kubeConfigPath);
          if (!resolved.startsWith(path.resolve(workspaceDir))) return;
          fs.unlinkSync(resolved);
          logger.info(`✓ Deleted kubeconfig: ${resolved}`);
        } catch {
          // Non-critical
        }
      },
    },
    {
      id: 'cleanup-storage-state',
      name: 'Delete storage state file',
      onError: 'skip',
      scope: TeardownScope.FILES,
      run: async () => {
        try {
          const dir = path.join(PROJECT_ROOT, '.storage-states');
          const file = path.join(dir, 'test-state.json');
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            logger.info(`✓ Deleted storage state: ${file}`);
          }
        } catch {
          // Non-critical
        }
      },
    },
    {
      id: 'cleanup-test-config',
      name: 'Delete test config file',
      onError: 'skip',
      scope: TeardownScope.FILES,
      run: async () => {
        try {
          TestConfigManager.deleteConfig();
          logger.info('✓ Deleted test configuration');
        } catch {
          // Non-critical
        }
      },
    },
    {
      id: 'cleanup-empty-dirs',
      name: 'Remove empty artifact directories',
      onError: 'skip',
      scope: TeardownScope.FILES,
      run: async () => {
        for (const dir of ['.kubeconfigs', '.test-configs', '.storage-states', '.test-data']) {
          const fullPath = path.join(PROJECT_ROOT, dir);
          try {
            if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) {
              fs.rmdirSync(fullPath);
            }
          } catch {
            // Non-critical
          }
        }
      },
    },
  ];
}
