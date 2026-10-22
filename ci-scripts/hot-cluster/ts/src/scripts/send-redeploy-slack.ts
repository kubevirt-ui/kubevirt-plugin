/**
 * Send a Slack notification with rotated credentials after a plugin redeploy.
 * Uses Node 22+ built-in fetch().
 *
 * Env: SLACK_WEBHOOK_URL, CONSOLE_URL, ACTOR, BRANCH, PR_NUMBER, REPO,
 *      AUTH_MODE (openshift|disabled)
 * When AUTH_MODE=openshift (default): MANUAL_CONSOLE_PASSWORD, MANUAL_CONSOLE_USER
 */

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('::warning::SLACK_WEBHOOK_URL not set — skipping Slack notification');
    return;
  }

  const consoleUrl = requireEnv('CONSOLE_URL');
  const actor = requireEnv('ACTOR');
  const repo = requireEnv('REPO');
  const branch = process.env.BRANCH ?? '';
  const prNumber = process.env.PR_NUMBER ?? '';
  const authMode = (process.env.AUTH_MODE ?? 'openshift').trim() || 'openshift';

  const sourceLine = prNumber
    ? `*PR:* <https://github.com/${repo}/pull/${prNumber}|#${prNumber}>`
    : `*Branch:* \`${branch}\``;

  const credentialLines =
    authMode === 'disabled'
      ? ['*Auth:* no login wall (console SA token)']
      : (() => {
          const password = requireEnv('MANUAL_CONSOLE_PASSWORD');
          const user = requireEnv('MANUAL_CONSOLE_USER');
          console.log(`::add-mask::${password}`);
          return [`*User:* \`${user}\``, `*Password (rotated):* \`${password}\``];
        })();

  const text = [
    ':arrows_counterclockwise: *Manual console plugin redeployed*',
    `*Triggered by:* @${actor}`,
    `*URL:* <${consoleUrl}>`,
    ...credentialLines,
    sourceLine,
  ].join('\n');

  const response = await fetch(webhookUrl, {
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Slack webhook returned ${response.status}: ${await response.text()}`);
  }

  console.log('Slack notification sent.');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
