/**
 * Resolve the path to playwright-runner-hc-e2e.sh for the hot-cluster test run.
 *
 * The script lives only on main. A plain main (or local) checkout has it at
 * the product repo root; a release-branch HC run (see hot-cluster-e2e-run.yml's
 * "Overlay hot-cluster CI infra from main" step) does not carry it on the
 * branch, so it is sparse-checked-out into .hc-infra alongside
 * ci-scripts/hot-cluster instead. Either way, Playwright must still run with
 * cwd = repoRoot so it picks up the branch's own playwright.config.ts/specs.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const HC_PLAYWRIGHT_RUNNER = 'playwright-runner-hc-e2e.sh';
const OVERLAY_DIR = '.hc-infra';

export const resolveHcPlaywrightRunner = (
  repoRoot: string,
  exists: (path: string) => boolean = existsSync,
): string => {
  const productPath = join(repoRoot, HC_PLAYWRIGHT_RUNNER);
  if (exists(productPath)) {
    return productPath;
  }

  const overlayPath = join(repoRoot, OVERLAY_DIR, HC_PLAYWRIGHT_RUNNER);
  if (exists(overlayPath)) {
    return overlayPath;
  }

  throw new Error(
    `Could not find ${HC_PLAYWRIGHT_RUNNER} at '${productPath}' or '${overlayPath}'. ` +
      `Expected it at the product repo root (main/local) or overlaid into ${OVERLAY_DIR} ` +
      `(release-branch HC run -- see hot-cluster-e2e-run.yml's CI infra overlay step).`,
  );
};
