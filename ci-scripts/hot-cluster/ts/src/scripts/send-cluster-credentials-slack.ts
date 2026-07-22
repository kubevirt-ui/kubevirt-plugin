/**
 * Send cluster credentials to Slack after successful setup.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: BRANCH_NAME
 * Optional env: SLACK_WEBHOOK_URL, ADMIN_PASSWORD, INSTALL_DIR
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const branchName = requireEnv('BRANCH_NAME');
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  const installDir = process.env.INSTALL_DIR ?? '';

  let consoleUrl: string;
  try {
    consoleUrl = execSync(
      "oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}'",
      {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )
      .replace(/'/g, '')
      .trim();
  } catch {
    consoleUrl = 'unknown';
  }

  let creds = '';
  if (installDir) {
    try {
      const pw = readFileSync(`${installDir}/auth/kubeadmin-password`, 'utf8').trim();
      if (pw) {
        console.log(`::add-mask::${pw}`);
        creds = `\n*kubeadmin:* \`${pw}\``;
      }
    } catch {
      /* no kubeadmin password file */
    }
  }

  if (!creds && adminPassword) {
    console.log(`::add-mask::${adminPassword}`);
    creds = `\n*admin:* \`${adminPassword}\``;
  }

  if (!slackWebhookUrl) {
    console.log('::warning::SLACK_WEBHOOK_URL not set — skipping Slack notification');
    return;
  }

  if (!creds) {
    console.log('::warning::No credentials available to send');
    return;
  }

  const text = `:white_check_mark: *Hot cluster ready [${branchName}]*\n*Console:* <${consoleUrl}>${creds}`;

  const response = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed with status ${response.status}`);
  }

  console.log('Slack notification sent.');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
