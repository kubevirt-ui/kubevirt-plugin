/**
 * Centralized test results / Allure output directory (kubevirt-ui main).
 *
 * - PLAYWRIGHT_OUTPUT_DIR: explicit path (absolute or relative to cwd)
 * - ARTIFACTS_DIR: write under repo root; pipeline artifact dirs created for archive
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
      // ignore
    }
  }
}

/**
 * @param repoRoot - Absolute path to repository root (parent of playwright.config.ts)
 */
export function getTestResultsDir(repoRoot: string): string {
  if (process.env.PLAYWRIGHT_OUTPUT_DIR) {
    const dir = process.env.PLAYWRIGHT_OUTPUT_DIR;
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
  }
  if (process.env.ARTIFACTS_DIR || EnvVariables.useAllure) {
    ensurePipelineArtifactDirs(repoRoot);
    return path.join(repoRoot, 'allure-results');
  }
  return path.join(repoRoot, 'test-results');
}
