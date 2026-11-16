import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from './env-variables';

/** Directory for Playwright auth state (gitignored). */
export function getStorageStateDir(): string {
  return path.resolve(process.cwd(), '.storage-states');
}

function resolveStorageStateFileName(): string {
  const shardIndex = EnvVariables.shardIndex;
  if (EnvVariables.isSharded && shardIndex) {
    return `shard-${shardIndex}-state.json`;
  }
  if (EnvVariables.isNonPrivUser) {
    return 'nonpriv-state.json';
  }
  return 'test-state.json';
}

/**
 * Path where global setup writes the session for the current mode (admin vs non-priv).
 * Always returns the expected path (file may be absent until global setup).
 */
export function getStorageStatePath(_configDirname?: string): string {
  return path.join(getStorageStateDir(), resolveStorageStateFileName());
}

/** Config-time path (always defined; file may not exist until global setup). */
export function getStorageStatePathForConfig(): string {
  return getStorageStatePath();
}

export function storageStateExists(): boolean {
  return fs.existsSync(getStorageStatePath());
}

/**
 * Playwright `storageState` option only when the auth file is on disk.
 * Avoids ENOENT when teardown deleted the file or setup was skipped.
 */
export function storageStateOption(): { storageState: string } | Record<string, never> {
  const storageStatePath = getStorageStatePath();
  return fs.existsSync(storageStatePath) ? { storageState: storageStatePath } : {};
}
