/**
 * Resolve which hot cluster hosts a PR's manual console for teardown.
 * Prefer an explicit name; otherwise recover the newest deploy record
 * (bot PR comment with marker / human line). Never invent a cluster from
 * the PR's current base ref or from run-name brackets.
 */

import type { Octokit } from '@octokit/rest';

import {
  clusterNameFromDeployRecordBody,
  isManualConsoleDeployBot,
} from './manual-console-cluster-record';

export type DeployClusterRecord = {
  at: number;
  clusterName: string;
  source: 'comment';
};

/** @deprecated use clusterNameFromDeployRecordBody — kept for test import paths */
export const clusterNameFromDeployComment = clusterNameFromDeployRecordBody;

export const collectDeployClusterRecordsFromComments = (
  comments: ReadonlyArray<{
    body?: string | null;
    created_at?: string;
    user?: { login?: string | null } | null;
  }>,
): DeployClusterRecord[] => {
  const records: DeployClusterRecord[] = [];
  for (const comment of comments) {
    if (!isManualConsoleDeployBot(comment.user?.login ?? undefined)) {
      continue;
    }
    const clusterName = clusterNameFromDeployRecordBody(comment.body ?? '');
    if (!clusterName) {
      continue;
    }
    const at = Date.parse(comment.created_at ?? '');
    records.push({
      at: Number.isFinite(at) ? at : 0,
      clusterName,
      source: 'comment',
    });
  }
  return records;
};

/** Newest record wins (by created_at). */
export const newestDeployClusterRecord = (
  records: readonly DeployClusterRecord[],
): string | undefined => {
  if (records.length === 0) {
    return undefined;
  }
  const sorted = [...records].sort((a, b) => b.at - a.at);
  return sorted[0]?.clusterName;
};

export const findRecordedManualConsoleCluster = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string | undefined> => {
  const comments = await octokit.paginate(octokit.issues.listComments, {
    issue_number: prNumber,
    owner,
    per_page: 100,
    repo,
  });

  return newestDeployClusterRecord(collectDeployClusterRecordsFromComments(comments));
};

/**
 * Explicit CLUSTER_NAME wins. Otherwise require a recorded deploy target —
 * do not fall back to inferring from the PR's current base ref.
 */
export const resolveCleanupClusterName = async (params: {
  explicitClusterName: string | undefined;
  findRecorded: () => Promise<string | undefined>;
}): Promise<string> => {
  const explicit = params.explicitClusterName?.trim();
  if (explicit) {
    return explicit;
  }

  const recorded = await params.findRecorded();
  if (recorded) {
    return recorded;
  }

  throw new Error(
    'Could not determine which cluster hosts this PR\'s manual console. ' +
      'Pass it explicitly: `/cleanup-manual-console <cluster-name>` ' +
      '(or re-run deploy so the target cluster is recorded on the PR).',
  );
};
