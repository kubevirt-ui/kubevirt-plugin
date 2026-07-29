import { type Octokit } from '@octokit/rest';

import { BLOCK_LABEL, VALIDATION_COMMENT_MARKER } from './types/index';

/** Post or update an idempotent comment identified by a hidden HTML marker. */
export const upsertComment = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  marker: string,
  body: string,
): Promise<void> => {
  const markedBody = `${marker}\n${body}`;

  const comments = await octokit.paginate(octokit.issues.listComments, {
    issue_number: issueNumber,
    owner,
    per_page: 100,
    repo,
  });

  const existing = comments.find((comment) => comment.body?.includes(marker));

  if (existing) {
    await octokit.issues.updateComment({ body: markedBody, comment_id: existing.id, owner, repo });
  } else {
    await octokit.issues.createComment({
      body: markedBody,
      issue_number: issueNumber,
      owner,
      repo,
    });
  }
};

/** Add a label to a PR, auto-creating the label if it doesn't exist. */
export const addLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string,
  labelMeta?: { color: string; description: string },
): Promise<void> => {
  try {
    await octokit.issues.getLabel({ name: label, owner, repo });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      await octokit.issues.createLabel({
        color: labelMeta?.color ?? 'e11d48',
        description: labelMeta?.description ?? 'Automated label for repository integration',
        name: label,
        owner,
        repo,
      });
    }
  }

  await octokit.issues.addLabels({ issue_number: issueNumber, labels: [label], owner, repo });
};

/** Remove a label from a PR (no-op if the label is not present). */
export const removeLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string,
): Promise<void> => {
  try {
    await octokit.issues.removeLabel({ issue_number: issueNumber, name: label, owner, repo });
  } catch (err: unknown) {
    // Only a missing label is a no-op -- other failures (auth, network) must
    // propagate so callers can't treat a failed revoke as success.
    if ((err as { status?: number }).status !== 404) {
      throw err;
    }
  }
};

/** Fetch all label names currently applied to a PR. */
export const getPrLabelNames = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<Set<string>> => {
  const { data: labels } = await octokit.issues.listLabelsOnIssue({
    issue_number: issueNumber,
    owner,
    per_page: 100,
    repo,
  });
  return new Set(labels.map((label) => label.name));
};

/** Check whether a specific label is present on a PR. */
export const hasLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string,
): Promise<boolean> => {
  const labels = await getPrLabelNames(octokit, owner, repo, issueNumber);
  return labels.has(label);
};

/** Create or update a GitHub commit status check. */
export const setCommitStatus = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  state: 'error' | 'failure' | 'pending' | 'success',
  description: string,
  context = 'jira-validation',
): Promise<void> => {
  await octokit.repos.createCommitStatus({
    context,
    description: description.slice(0, 140),
    owner,
    repo,
    sha,
    state,
  });
};

/** Update the validation comment and add/remove the block label based on result. */
export const reportValidation = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  passed: boolean,
  commentBody: string,
): Promise<void> => {
  await upsertComment(octokit, owner, repo, prNumber, VALIDATION_COMMENT_MARKER, commentBody);

  if (passed) {
    await removeLabel(octokit, owner, repo, prNumber, BLOCK_LABEL);
  } else {
    await addLabel(octokit, owner, repo, prNumber, BLOCK_LABEL);
  }
};
