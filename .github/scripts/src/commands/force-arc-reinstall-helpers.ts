import type { Octokit } from '@octokit/rest';

import { failStep, setOutput } from '../shared/output';

/** Build the comment body for a /force-arc-reinstall report. */
export const buildForceArcReinstallReport = (
  owner: string,
  repo: string,
  wasCancelled: boolean,
): string => {
  const lines = [
    '🔧 `/force-arc-reinstall` dispatched a fresh Hot Cluster E2E run with a forced ARC listener reinstall.',
    '',
    "> ⚠️ This reinstalls the GitHub Actions runner listener on the **shared** cluster for this branch's pool -- it may transiently disrupt queued jobs for other PRs using the same cluster.",
    '',
  ];
  if (wasCancelled) {
    lines.push(
      '> A previously in-progress run was found and will be superseded by the new run.',
      '',
    );
  }
  lines.push(
    `Track progress in the [Actions tab](https://github.com/${owner}/${repo}/actions/workflows/hot-cluster-e2e.yml).`,
  );
  return lines.join('\n');
};

/** Report an unexpected error for /force-arc-reinstall. */
export const reportForceArcReinstallError = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  message: string,
): Promise<void> => {
  setOutput('unexpected_error', 'true');
  setOutput('error_message', message);

  try {
    await octokit.issues.createComment({
      body: `⚠️ \`/force-arc-reinstall\` hit an unexpected error:\n\n\`\`\`\n${message}\n\`\`\``,
      issue_number: prNumber,
      owner,
      repo,
    });
  } catch {
    /* best effort */
  }

  failStep(message);
};
