/**
 * Generate a random base64-encoded password and output it (masked)
 * to GITHUB_OUTPUT. Replaces `openssl rand -base64 24`.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 */

import { randomBytes } from 'node:crypto';

import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const password = randomBytes(24).toString('base64');

  console.log(`::add-mask::${password}`);
  setOutput('password', password);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
