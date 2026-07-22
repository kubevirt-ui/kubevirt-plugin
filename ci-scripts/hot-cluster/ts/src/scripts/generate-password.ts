/**
 * Generate a random base64-encoded password and output it (masked)
 * to GITHUB_OUTPUT. Replaces `openssl rand -base64 24`.
 * Shared by deploy-manual-console.yml and deploy-plugin.yml.
 */

import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';

const main = (): void => {
  const password = randomBytes(24).toString('base64');

  console.log(`::add-mask::${password}`);
  appendFileSync(process.env.GITHUB_OUTPUT!, `password=${password}\n`);
};

main();
