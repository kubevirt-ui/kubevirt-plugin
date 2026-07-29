/**
 * Send cluster credentials to Slack after successful setup.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: BRANCH_NAME
 * Optional env: SLACK_WEBHOOK_URL, ADMIN_PASSWORD, INSTALL_DIR
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const branchName = requireEnv('BRANCH_NAME');
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  const installDir = process.env.INSTALL_DIR ?? '';

  const consoleUrl = ((): string => {
    try {
      return execSync(
        "oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}'",
        {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      )
        .replace(/'/g, '')
        .trim();
    } catch {
      return 'unknown';
    }
  })();

  const creds = ((): string => {
    if (installDir) {
      try {
        const password = readFileSync(`${installDir}/auth/kubeadmin-password`, 'utf8').trim();
        if (password) {
          console.log(`::add-mask::${password}`);
          return `\n*kubeadmin:* \`${password}\``;
        }
      } catch {
        /* no kubeadmin password file */
      }
    }
    if (adminPassword) {
      console.log(`::add-mask::${adminPassword}`);
      return `\n*admin:* \`${adminPassword}\``;
    }
    return '';
  })();

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
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed with status ${response.status}`);
  }

  console.log('Slack notification sent.');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
