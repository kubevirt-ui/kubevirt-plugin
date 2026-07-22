/**
 * Compute a DNS-safe instance key from a PR number or branch name.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 *
 * Self-contained (no external deps) so it can run on ubuntu-latest
 * with bare `npx tsx` — no `npm ci` required.
 *
 * Env: PR_NUMBER (optional), BRANCH
 */

import { createHash } from 'node:crypto';
import { appendFileSync } from 'node:fs';

const main = (): void => {
  const prNumber = process.env.PR_NUMBER ?? '';
  const branch = process.env.BRANCH ?? '';

  let key: string;

  if (prNumber) {
    if (!/^\d+$/.test(prNumber)) {
      console.error(`::error::pr_number must be numeric, got '${prNumber}'`);
      process.exit(1);
    }
    key = `pr-${prNumber}`;
  } else {
    // Budget: "console-manual-console-<key>" becomes the first label of the
    // console Route host, which must stay <=63 chars (DNS-1123) — 24 are
    // already spent on that fixed prefix.  A short sanitized prefix paired
    // with an 8-hex-char hash of the full branch name is both deterministic
    // (same branch → same key) and collision-resistant.
    const sanitized = branch.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const prefix =
      sanitized.slice(0, 11).replace(/^-+/, '').replace(/-+$/, '') || 'branch';
    const hash = createHash('sha256').update(branch).digest('hex').slice(0, 8);
    key = `${prefix}-${hash}`;
  }

  appendFileSync(process.env.GITHUB_OUTPUT!, `key=${key}\n`);
  console.log(`Computed instance key: ${key}`);
};

main();
