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
    dotenv.config({ path: ENV_FILE_PATH, override: false });
  }
  const isLocal = process.env.IS_LOCAL === '1' || process.env.IS_LOCAL?.toLowerCase() === 'true';
  if (!process.env.KUBECONFIG && !isLocal) {
    const kubeconfig = path.resolve(__dirname, '..', '.kubeconfigs', 'test-config');
    if (fs.existsSync(kubeconfig)) {
      process.env.KUBECONFIG = kubeconfig;
    }
  }
  loaded = true;
}

loadProjectEnv();
