/**
 * Centralized test results output directory.
 *
 * Used by playwright.config.ts and global setup so all artifacts write to the same path.
 *
 * - PLAYWRIGHT_OUTPUT_DIR: explicit path (absolute or relative to cwd)
 * - Default: repo-root/test-results
 */

import * as path from 'path';

/**
 * Returns the directory for test results output.
 *
 * @param repoRoot - Absolute path to repo root (parent of playwright/)
 */
export function getTestResultsDir(repoRoot: string): string {
  if (process.env.PLAYWRIGHT_OUTPUT_DIR) {
    const dir = process.env.PLAYWRIGHT_OUTPUT_DIR;
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
  }
  return path.join(repoRoot, 'test-results');
}
