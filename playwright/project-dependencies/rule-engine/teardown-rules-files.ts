import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

/** Repo root: rule-engine → project-dependencies → playwright → kubevirt-plugin */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

function safeWarn(message: string, err: unknown): void {
  const detail = err instanceof Error ? err.message : String(err);
  logger.warn(`${message}: ${detail}`);
}

export function getFilesTeardownRules(): TeardownRule[] {
  return [
    {
      guard: () => !EnvVariables.isDebugMode,
      id: 'cleanup-kubeconfig',
      name: 'Delete kubeconfig file',
      onError: 'skip',
      run: async (ctx) => {
        try {
          const kubeConfigPath = ctx.kubeConfigPath;
          if (!kubeConfigPath || !fs.existsSync(kubeConfigPath)) {
            return;
          }

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
      scope: TeardownScope.FILES,
    },
    {
      guard: () => !EnvVariables.isLocalMode,
      id: 'cleanup-storage-state',
      name: 'Delete storage state file',
      onError: 'skip',
      run: async (ctx) => {
        try {
          const storageStateDir = path.join(PROJECT_ROOT, '.storage-states');
          let storageStateFileName: string;
          if (ctx.useSharding && ctx.shardIndex) {
            storageStateFileName = `shard-${ctx.shardIndex}-state.json`;
          } else if (EnvVariables.isNonPrivUser) {
            storageStateFileName = 'nonpriv-state.json';
          } else {
            storageStateFileName = 'test-state.json';
          }
          const storageStatePath = path.join(storageStateDir, storageStateFileName);
          if (fs.existsSync(storageStatePath)) {
            fs.unlinkSync(storageStatePath);
            logger.info(`✓ Deleted storage state file: ${storageStatePath}`);
          }
        } catch (error: unknown) {
          safeWarn('Failed to delete storage state file', error);
        }
      },
      scope: TeardownScope.FILES,
    },
    {
      id: 'cleanup-empty-dirs',
      name: 'Remove empty artifact directories',
      onError: 'skip',
      run: async () => {
        try {
          const kubeConfigDir = path.join(PROJECT_ROOT, '.kubeconfigs');
          const storageStateDir = path.join(PROJECT_ROOT, '.storage-states');

          if (fs.existsSync(kubeConfigDir)) {
            const kubeFiles = fs.readdirSync(kubeConfigDir);
            if (kubeFiles.length === 0) {
              fs.rmdirSync(kubeConfigDir);
              logger.info('✓ Cleaned up .kubeconfigs directory');
            } else {
              logger.info(`📁 .kubeconfigs directory still contains ${kubeFiles.length} file(s)`);
            }
          }

          if (fs.existsSync(storageStateDir)) {
            const stateFiles = fs.readdirSync(storageStateDir);
            if (stateFiles.length === 0) {
              fs.rmdirSync(storageStateDir);
              logger.info('✓ Cleaned up .storage-states directory');
            } else {
              logger.info(
                `📁 .storage-states directory still contains ${stateFiles.length} file(s)`,
              );
            }
          }
        } catch {
          // not critical
        }
      },
      scope: TeardownScope.FILES,
    },
  ];
}
