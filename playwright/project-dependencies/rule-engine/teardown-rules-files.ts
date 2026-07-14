import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';
import { logger } from '@/utils/logger';
import { TestConfigManager } from '@/utils/test-config';

import type { TeardownRule } from './types';
import { TeardownScope } from './types';

/** Repo root: rule-engine → project-dependencies → playwright → kubevirt-ui */
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
      guard: () => !EnvVariables.isDebugMode,
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
    },
    {
      id: 'cleanup-storage-state',
      name: 'Delete storage state file',
      scope: TeardownScope.FILES,
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
          const kubeConfigDir = path.join(PROJECT_ROOT, '.kubeconfigs');
          const testConfigDir = path.join(PROJECT_ROOT, '.test-configs');
          const storageStateDir = path.join(PROJECT_ROOT, '.storage-states');
          const testDataDir = path.join(PROJECT_ROOT, '.test-data');

          if (fs.existsSync(kubeConfigDir)) {
            const kubeFiles = fs.readdirSync(kubeConfigDir);
            if (kubeFiles.length === 0) {
              fs.rmdirSync(kubeConfigDir);
              logger.info('✓ Cleaned up .kubeconfigs directory');
            } else {
              logger.info(`📁 .kubeconfigs directory still contains ${kubeFiles.length} file(s)`);
            }
          }

          if (fs.existsSync(testConfigDir)) {
            const configFiles = fs.readdirSync(testConfigDir);
            if (configFiles.length === 0) {
              fs.rmdirSync(testConfigDir);
              logger.info('✓ Cleaned up .test-configs directory');
            } else {
              logger.info(
                `📁 .test-configs directory still contains ${configFiles.length} file(s)`,
              );
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

          if (fs.existsSync(testDataDir)) {
            try {
              const testDataFiles = fs.readdirSync(testDataDir);
              testDataFiles.forEach((file) => {
                const filePath = path.join(testDataDir, file);
                try {
                  fs.unlinkSync(filePath);
                  logger.info(`✓ Deleted test data file: ${file}`);
                } catch (fileError: unknown) {
                  safeWarn(`⚠️ Failed to delete test data file ${file}`, fileError);
                }
              });

              fs.rmdirSync(testDataDir);
              logger.info('✓ Cleaned up .test-data directory');
            } catch (testDataError: unknown) {
              safeWarn('Failed to clean up .test-data directory', testDataError);
            }
          }
        } catch {
          // Silently ignore directory cleanup errors - not critical
        }
      },
    },
  ];
}
