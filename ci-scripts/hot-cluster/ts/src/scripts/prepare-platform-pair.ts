/**
 * Convert a Docker platform string (e.g. linux/amd64) to a dash-separated
 * pair (linux-amd64) and append it to GITHUB_ENV as PLATFORM_PAIR.
 *
 * Required env: PLATFORM
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const platform = requireEnv('PLATFORM');
  const pair = platform.replace(/\//g, '-');

  appendFileSync(process.env.GITHUB_ENV!, `PLATFORM_PAIR=${pair}\n`);
  console.log(`PLATFORM_PAIR=${pair}`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
