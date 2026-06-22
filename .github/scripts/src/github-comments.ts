import { Octokit } from '@octokit/rest';

import { BLOCK_LABEL, VALIDATION_COMMENT_MARKER } from './types/index.js';

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
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });

  const existing = comments.find((c) => c.body?.includes(marker));

  if (existing) {
    await octokit.issues.updateComment({ owner, repo, comment_id: existing.id, body: markedBody });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: markedBody,
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
): Promise<void> => {
  try {
    await octokit.issues.getLabel({ owner, repo, name: label });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      await octokit.issues.createLabel({
        owner,
        repo,
        name: label,
        color: 'e11d48',
        description: 'Automated label for Jira integration',
      });
    }
  }

  await octokit.issues.addLabels({ owner, repo, issue_number: issueNumber, labels: [label] });
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
    await octokit.issues.removeLabel({ owner, repo, issue_number: issueNumber, name: label });
  } catch {
    // Label not present
  }
};

/** Check whether a specific label is present on a PR. */
export const hasLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  label: string,
): Promise<boolean> => {
  const { data: labels } = await octokit.issues.listLabelsOnIssue({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });
  return labels.some((l) => l.name === label);
};

/** Create or update a GitHub commit status for the jira-validation check. */
export const setCommitStatus = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  state: 'pending' | 'success' | 'failure' | 'error',
  description: string,
): Promise<void> => {
  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state,
    context: 'jira-validation',
    description: description.slice(0, 140),
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
