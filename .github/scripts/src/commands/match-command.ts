/**
 * Match an exact slash command in a comment body using a word-boundary regex.
 * Sets output `matched` to "true" or "false".
 *
 * Entry point: npx tsx src/commands/match-command.ts
 *
 * Required env: COMMENT_BODY, COMMAND
 */

import { requireEnv } from '../utils';
import { setOutput, failStep } from '../shared/output';

const main = (): void => {
  const body = process.env.COMMENT_BODY ?? '';
  const command = requireEnv('COMMAND');

  const pattern = new RegExp(`(^|\\s)${command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
  const matched = pattern.test(body);
  setOutput('matched', matched ? 'true' : 'false');
};

try {
  main();
} catch (err) {
  failStep(err instanceof Error ? err.message : String(err));
}
