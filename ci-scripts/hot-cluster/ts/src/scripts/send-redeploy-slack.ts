/**
 * Send a Slack notification with rotated credentials after a plugin redeploy.
 * Uses Node 22+ built-in fetch().
 *
 * Env: SLACK_WEBHOOK_URL, CONSOLE_URL, MANUAL_CONSOLE_PASSWORD,
 *      MANUAL_CONSOLE_USER, ACTOR, BRANCH, PR_NUMBER, REPO
 */

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('::warning::SLACK_WEBHOOK_URL not set — skipping Slack notification');
    return;
  }

  const consoleUrl = requireEnv('CONSOLE_URL');
  const password = requireEnv('MANUAL_CONSOLE_PASSWORD');
  const user = requireEnv('MANUAL_CONSOLE_USER');
  const actor = requireEnv('ACTOR');
  const repo = requireEnv('REPO');
  const branch = process.env.BRANCH ?? '';
  const prNumber = process.env.PR_NUMBER ?? '';

  console.log(`::add-mask::${password}`);

  const sourceLine = prNumber
    ? `*PR:* <https://github.com/${repo}/pull/${prNumber}|#${prNumber}>`
    : `*Branch:* \`${branch}\``;

  const text = [
    ':arrows_counterclockwise: *Manual console plugin redeployed*',
    `*Triggered by:* @${actor}`,
    `*URL:* <${consoleUrl}>`,
    `*User:* \`${user}\``,
    `*Password (rotated):* \`${password}\``,
    sourceLine,
  ].join('\n');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook returned ${response.status}: ${await response.text()}`);
  }

  console.log('Slack notification sent.');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
