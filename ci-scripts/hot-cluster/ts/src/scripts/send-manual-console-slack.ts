/**
 * Send a Slack notification with manual console credentials after deploy.
 * Uses Node 22+ built-in fetch().
 *
 * Env: SLACK_WEBHOOK_URL, CONSOLE_URL, MANUAL_CONSOLE_PASSWORD,
 *      MANUAL_CONSOLE_USER, ACTOR, BRANCH, PR_NUMBER, HEAD_REPO, REPO, RUN_ID
 */

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(
      '::warning::SLACK_WEBHOOK_URL not set — skipping Slack notification',
    );
    return;
  }

  const consoleUrl = requireEnv('CONSOLE_URL');
  const password = requireEnv('MANUAL_CONSOLE_PASSWORD');
  const user = requireEnv('MANUAL_CONSOLE_USER');
  const actor = requireEnv('ACTOR');
  const repo = requireEnv('REPO');
  const runId = requireEnv('RUN_ID');
  const branch = process.env.BRANCH ?? '';
  const prNumber = process.env.PR_NUMBER ?? '';
  const headRepo = process.env.HEAD_REPO ?? '';

  console.log(`::add-mask::${password}`);

  let sourceLine: string;
  let cleanupLine = '';
  if (prNumber) {
    sourceLine = `*PR:* <https://github.com/${repo}/pull/${prNumber}|#${prNumber}> (\`${headRepo}\`)`;
    cleanupLine =
      '\nDone with it? Comment `/cleanup-manual-console` on the PR.';
  } else {
    sourceLine = `*Branch:* \`${branch}\``;
  }

  const text =
    [
      ':rocket: *Manual console ready*',
      `*Triggered by:* @${actor}`,
      `*URL:* <${consoleUrl}>`,
      `*User:* \`${user}\``,
      `*Password:* \`${password}\``,
      sourceLine,
      `*Run:* <https://github.com/${repo}/actions/runs/${runId}>`,
    ].join('\n') + cleanupLine;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(
      `Slack webhook returned ${response.status}: ${await response.text()}`,
    );
  }

  console.log('Slack notification sent.');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
