import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

function safeWarn(message: string, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err);
  logger.warn(`${message}: ${detail}`);
}

export function getFilesTeardownRules(): TeardownRule[] {
  return [
    {
      id: 'cleanup-kubeconfig',
      name: 'Delete kubeconfig file',
      scope: TeardownScope.FILES,
      onError: 'skip',
      run: async (ctx) => {
        try {
          const kubeConfigPath = ctx.kubeConfigPath;
          if (!kubeConfigPath || !fs.existsSync(kubeConfigPath)) return;

          const workspaceKubeConfigDir = path.join(PROJECT_ROOT, '.kubeconfigs');
          const resolved = path.resolve(kubeConfigPath);
          if (!resolved.startsWith(path.resolve(workspaceKubeConfigDir))) {
            logger.warn(
              `⚠️ Refusing to delete kubeconfig outside workspace .kubeconfigs/: ${resolved}`,
            );
            return;
          }

          fs.unlinkSync(resolved);
          logger.info(`✓ Deleted kubeconfig file: ${resolved}`);
        } catch (error: unknown) {
          safeWarn('Failed to delete kubeconfig file', error);
        }
      },
    },
    {
      id: 'cleanup-storage-state',
      name: 'Delete storage state file',
      scope: TeardownScope.FILES,
      onError: 'skip',
      run: async () => {
        try {
          const storageStateDir = path.join(PROJECT_ROOT, '.storage-states');
          const storageStateFileName = EnvVariables.isNonPrivUser
            ? 'nonpriv-state.json'
            : 'test-state.json';
          const storageStatePath = path.join(storageStateDir, storageStateFileName);
          if (fs.existsSync(storageStatePath)) {
            fs.unlinkSync(storageStatePath);
            logger.info(`✓ Deleted storage state file: ${storageStatePath}`);
          }
        } catch (error: unknown) {
          safeWarn('Failed to delete storage state file', error);
        }
      },
    },
    {
      id: 'cleanup-test-config',
      name: 'Delete test config file',
      scope: TeardownScope.FILES,
      onError: 'skip',
      run: async () => {
        try {
          TestConfigManager.deleteConfig();
          logger.info('✓ Deleted test configuration file');
        } catch (error: unknown) {
          safeWarn('Failed to delete test config', error);
        }
      },
    },
    {
      id: 'cleanup-empty-dirs',
      name: 'Remove empty artifact directories',
      scope: TeardownScope.FILES,
      onError: 'skip',
      run: async () => {
        try {
          for (const dir of ['.kubeconfigs', '.test-configs', '.storage-states', '.test-data']) {
            const fullPath = path.join(PROJECT_ROOT, dir);
            try {
              if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath);
                if (files.length === 0) {
                  fs.rmdirSync(fullPath);
                  logger.info(`✓ Cleaned up ${dir} directory`);
                }
              }
            } catch {
              // Non-critical
            }
          }
        } catch {
          // Silently ignore
        }
      },
    },
  ];
}
