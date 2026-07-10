/**
 * Centralized test results / Allure output directory for pipeline compatibility.
 *
 * Used by playwright.config.ts, global setup, and scenario fixture so all write
 * to the same path. Allure is the default (USE_ALLURE=1); set USE_ALLURE=0 to use test-results.
 *
 * - PLAYWRIGHT_OUTPUT_DIR: explicit path (absolute or relative to cwd)
 * - ARTIFACTS_DIR: write under repo root; all pipeline artifact dirs created so archive never fails
 * - USE_ALLURE default on: repo-root/allure-results (set USE_ALLURE=0 for test-results)
 */

import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from './env-variables';

const PIPELINE_ARTIFACT_DIRS = [
  'allure-results',
  'allure-report',
  'test-results',
  'junit-results',
] as const;

function ensurePipelineArtifactDirs(repoRoot: string): void {
  for (const name of PIPELINE_ARTIFACT_DIRS) {
    try {
      fs.mkdirSync(path.join(repoRoot, name), { recursive: true });
    } catch {
      // Ignore
    }
  }
}

/**
 * Returns the directory for test results and Allure output.
 * Allure is default; when enabled, creates pipeline artifact dirs so Jenkins archive always matches.
 *
 * @param repoRoot - Absolute path to repo root (parent of playwright/)
 */
export function getTestResultsDir(repoRoot: string): string {
  if (process.env.PLAYWRIGHT_OUTPUT_DIR) {
    const dir = process.env.PLAYWRIGHT_OUTPUT_DIR;
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
  }
  if (process.env.ARTIFACTS_DIR) {
    ensurePipelineArtifactDirs(repoRoot);
  }
  if (EnvVariables.useAllure) {
    ensurePipelineArtifactDirs(repoRoot);
    return path.join(repoRoot, 'allure-results');
  }
  return path.join(repoRoot, 'test-results');
}
