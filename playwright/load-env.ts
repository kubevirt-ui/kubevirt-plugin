import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

/** Repo root `.env` (same directory as `playwright.config.ts`). */
export const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env');

let loaded = false;

/**
 * Load `.env` into `process.env`. Safe to call multiple times (idempotent).
 * Uses `override: false` so explicit shell/CI env wins over file values.
 */
export function loadProjectEnv(): void {
  if (loaded) {
    return;
  }
  if (fs.existsSync(ENV_FILE_PATH)) {
    dotenv.config({ override: false, path: ENV_FILE_PATH, quiet: true });
  }
  const isLocal = process.env.IS_LOCAL === '1' || process.env.IS_LOCAL?.toLowerCase() === 'true';
  const isNonPriv = process.env.NON_PRIV === '1' || process.env.NON_PRIV?.toLowerCase() === 'true';
  if (!process.env.KUBECONFIG && !isLocal && isNonPriv) {
    const kubeDir = path.resolve(__dirname, '..', '.kubeconfigs');
    for (const name of ['test-config', 'playwright-e2e-config']) {
      const kubeconfig = path.join(kubeDir, name);
      if (fs.existsSync(kubeconfig)) {
        process.env.KUBECONFIG = kubeconfig;
        break;
      }
    }
  }
  loaded = true;
}

loadProjectEnv();
