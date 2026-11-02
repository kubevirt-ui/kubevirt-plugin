import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from '@/utils/env-variables';

/** Directory for Playwright auth state (gitignored). */
export function getStorageStateDir(): string {
  return path.resolve(process.cwd(), '.storage-states');
}

/**
 * Path where global setup writes the session for the current mode (admin vs non-priv).
 * Tests consume this via `use.storageState` in playwright.config — not via login specs.
 */
export function getStorageStatePath(): string {
  const fileName = EnvVariables.isNonPrivUser ? 'nonpriv-state.json' : 'test-state.json';
  return path.join(getStorageStateDir(), fileName);
}

export function storageStateExists(): boolean {
  return fs.existsSync(getStorageStatePath());
}
