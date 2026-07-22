/**
 * Configure git user identity for the github-actions[bot] account.
 */

import { execSync } from 'node:child_process';

const main = async (): Promise<void> => {
  execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"', {
    stdio: 'inherit',
  });
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
