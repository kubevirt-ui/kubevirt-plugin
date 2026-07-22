/**
 * Write the final job summary for a deploy or redeploy run.
 * Shared by deploy-manual-console.yml (MODE=deploy) and
 * deploy-plugin.yml (MODE=redeploy).
 *
 * Env: CONSOLE_URL (may be empty on failure), MODE (deploy|redeploy)
 */

import { appendFileSync } from 'node:fs';

const main = (): void => {
  const consoleUrl = process.env.CONSOLE_URL ?? '';
  const mode = process.env.MODE ?? 'deploy';
  const isRedeploy = mode === 'redeploy';

  const lines: string[] = [];

  if (isRedeploy) {
    lines.push('## Plugin Redeployed', '');
  } else {
    lines.push('', '### Result', '');
  }

  if (consoleUrl) {
    lines.push(`Console URL: ${consoleUrl}`, '');
    lines.push(
      isRedeploy
        ? 'Login password was rotated and sent to Slack (if `SLACK_WEBHOOK_URL` is configured).'
        : 'Login credentials were sent to Slack (if `SLACK_WEBHOOK_URL` is configured).',
    );
  } else {
    lines.push(
      isRedeploy
        ? ':x: Redeploy did not complete successfully — see logs above.'
        : ':x: Deploy did not complete successfully — see logs above.',
    );
  }

  const output = lines.join('\n');
  console.log(output);

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) appendFileSync(summaryFile, output + '\n');
};

main();
