/**
 * Compute the head SHA and commit-status context name for consistent
 * "Hot Cluster E2E Progress" postings across the pipeline.
 *
 * Required env: GITHUB_EVENT_NAME, GITHUB_SHA
 * Optional env: RESOLVED_HEAD_SHA, PR_NUMBER, GITHUB_EVENT_PATH
 *
 * Outputs: head_sha, status_context, is_adhoc_dispatch
 */

import { readFileSync } from 'node:fs';

import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const eventName = process.env.GITHUB_EVENT_NAME ?? '';
  const resolvedHeadSha = process.env.RESOLVED_HEAD_SHA ?? '';
  const prNumber = process.env.PR_NUMBER ?? '';
  const contextSha = process.env.GITHUB_SHA ?? '';

  const headSha: string = ((): string => {
    if (eventName === 'pull_request_target') {
      try {
        const eventPath = process.env.GITHUB_EVENT_PATH ?? '';
        const payload = JSON.parse(readFileSync(eventPath, 'utf8')) as {
          pull_request?: { head?: { sha?: string } };
        };
        return payload.pull_request?.head?.sha ?? contextSha;
      } catch {
        return contextSha;
      }
    }
    return resolvedHeadSha || contextSha;
  })();

  const isAdHocDispatch = eventName === 'workflow_dispatch' && !prNumber;

  const statusContext = isAdHocDispatch
    ? 'Hot Cluster E2E Progress (manual dispatch)'
    : 'Hot Cluster E2E Progress';

  console.log(
    `head_sha=${headSha}, status_context=${statusContext}, is_adhoc_dispatch=${isAdHocDispatch}`,
  );

  setOutput('head_sha', headSha);
  setOutput('status_context', statusContext);
  setOutput('is_adhoc_dispatch', isAdHocDispatch ? 'true' : 'false');
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
