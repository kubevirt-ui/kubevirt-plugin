import type { Octokit } from '@octokit/rest';

import { failStep, setOutput } from '../shared/output';

/** Build the comment body for a /retest-e2e report. */
export const buildRetestReport = (owner: string, repo: string, wasCancelled: boolean): string => {
  const lines = ['🚀 `/retest-e2e` dispatched a fresh Hot Cluster E2E run for this PR.', ''];
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

/** Report an unexpected error for /retest-e2e. */
export const reportRetestE2EError = async (
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
      body: `⚠️ \`/retest-e2e\` hit an unexpected error:\n\n\`\`\`\n${message}\n\`\`\``,
      issue_number: prNumber,
      owner,
      repo,
    });
  } catch {
    /* best effort */
  }

  failStep(message);
};
