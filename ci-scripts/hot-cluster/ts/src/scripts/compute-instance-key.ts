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

const main = async (): Promise<void> => {
  const prNumber = process.env.PR_NUMBER ?? '';
  const branch = process.env.BRANCH ?? '';

  const key = prNumber
    ? ((): string => {
        if (!/^\d+$/.test(prNumber)) {
          console.error(`::error::pr_number must be numeric, got '${prNumber}'`);
          process.exit(1);
        }
        return `pr-${prNumber}`;
      })()
    : ((): string => {
        const sanitized = branch.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let prefix = sanitized.slice(0, 11).replace(/^-+/, '');
        let end = prefix.length;
        while (end > 0 && prefix[end - 1] === '-') end--;
        prefix = prefix.slice(0, end) || 'branch';
        const hash = createHash('sha256').update(branch).digest('hex').slice(0, 8);
        return `${prefix}-${hash}`;
      })();

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `key=${key}\n`);
  }
  console.log(`Computed instance key: ${key}`);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
