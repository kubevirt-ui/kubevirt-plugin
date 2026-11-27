// @ai-rules:
// 1. [Constraint]: Only ever FILL IN missing Jira data. Never overwrite or remove an existing value.
// 2. [Constraint]: Components are added with an `add` operation so existing ones are preserved.

import type { Octokit } from '@octokit/rest';

import { hasLabel } from '../github-comments';
import { getReleaseBranches } from '../github-repo';
import { JiraClient } from '../jira-client';
import type { JiraIssue, JiraVersion } from '../types/index';
import { JIRA_BASE_URL, JIRA_PROJECT_KEY, REQUIRED_COMPONENT, SKIP_LABEL } from '../types/index';
import { safeErrorMessage } from '../utils';
import { isLabelAppliedByTrustedActor } from '../validation/pr-path-validation/owners';
import { getExpectedVersionForBranch } from '../version-compare';
import { extractTicketIds, extractVersionNumber } from '../version-parse';

type Client = Pick<JiraClient, 'getIssue' | 'getProjectVersions' | 'updateIssue'>;

export type JiraPlan = {
  changes: string[];
  fields: Record<string, unknown>;
  notes: string[];
  update: Record<string, unknown>;
};

const isZStream = (version: JiraVersion): boolean => /\.z\b/i.test(version.name);

/** The single unambiguous Fix Version for a base branch, or null (missing or ambiguous). */
export const pickFixVersion = (
  versions: JiraVersion[],
  expectedVersion: string,
  baseBranch: string,
): JiraVersion | null => {
  const open = versions.filter(
    (version) => !version.archived && extractVersionNumber(version.name) === expectedVersion,
  );
  // main: the next release (not a released one, not a .z stream); release-X.Y: its .z stream.
  const pool =
    baseBranch === 'main'
      ? open.filter((version) => !version.released && !isZStream(version))
      : open.some(isZStream)
        ? open.filter(isZStream)
        : open;
  return pool.length === 1 ? (pool[0] ?? null) : null;
};

/** Compute the safe, missing-only updates for one ticket. */
export const planJira = (
  issue: JiraIssue,
  versions: JiraVersion[],
  expectedVersion: null | string,
  baseBranch: string,
): JiraPlan => {
  const plan: JiraPlan = { changes: [], fields: {}, notes: [], update: {} };
  const { components, fixVersions } = issue.fields;

  if (!components.some((item) => item.name.toLowerCase() === REQUIRED_COMPONENT.toLowerCase())) {
    const before = components.map((item) => item.name);
    plan.update.components = [{ add: { name: REQUIRED_COMPONENT } }];
    plan.changes.push(
      `Component: \`${before.join(', ') || 'none'}\` -> \`${[...before, REQUIRED_COMPONENT].join(', ')}\``,
    );
  }

  if (fixVersions.length > 0) {
    return plan; // an existing Fix Version is never overwritten, even when it looks wrong
  }
  const picked = expectedVersion ? pickFixVersion(versions, expectedVersion, baseBranch) : null;
  if (picked) {
    plan.fields.fixVersions = [{ id: picked.id }];
    plan.changes.push(`Fix Version: \`none\` -> \`${picked.name}\``);
  } else {
    plan.notes.push(`Fix Version is empty; no single unambiguous version for \`${baseBranch}\``);
  }
  return plan;
};

/** Update every CNV ticket in the PR title; returns one report line per change or note. */
export const applyJira = async (
  jira: Client,
  input: { baseBranch: string; expectedVersion: null | string; title: string },
): Promise<string[]> => {
  const keys = extractTicketIds(input.title);
  if (keys.length === 0) {
    return ['No `CNV-XXXXX` ticket in the PR title; Jira not updated.'];
  }
  const lines: string[] = [];
  const versions = await jira.getProjectVersions(JIRA_PROJECT_KEY);
  for (const key of keys) {
    try {
      const plan = planJira(
        await jira.getIssue(key),
        versions,
        input.expectedVersion,
        input.baseBranch,
      );
      if (plan.changes.length > 0) {
        await jira.updateIssue(key, { fields: plan.fields, update: plan.update });
      }
      lines.push(...plan.changes.map((line) => `${key} ${line}`));
      lines.push(...plan.notes.map((line) => `${key}: ${line}`));
    } catch (err) {
      lines.push(`${key}: update failed (${safeErrorMessage(err)})`);
    }
  }
  return lines;
};

/** Entry used by apply.ts: honours a trusted `skip-jira-check` label and a missing token. */
export const runJira = async (
  octokit: Octokit,
  ctx: { baseBranch: string; owner: string; prNumber: number; repo: string; title: string },
): Promise<string[]> => {
  const { owner, prNumber, repo } = ctx;
  if (
    (await hasLabel(octokit, owner, repo, prNumber, SKIP_LABEL)) &&
    (await isLabelAppliedByTrustedActor(octokit, owner, repo, prNumber, SKIP_LABEL))
  ) {
    return [`Jira skipped: \`${SKIP_LABEL}\` label is present.`];
  }
  if (!process.env.JIRA_TOKEN) {
    return ['Jira skipped: `JIRA_TOKEN` is not available.'];
  }
  const jira = new JiraClient({
    baseUrl: JIRA_BASE_URL,
    projectKey: JIRA_PROJECT_KEY,
    token: process.env.JIRA_TOKEN,
  });
  const releaseBranches = await getReleaseBranches(octokit, owner, repo);
  return applyJira(jira, {
    baseBranch: ctx.baseBranch,
    expectedVersion: getExpectedVersionForBranch(ctx.baseBranch, releaseBranches),
    title: ctx.title,
  });
};
