import type { Octokit } from '@octokit/rest';

import { hasLabel, reportValidation } from '../../github-comments';
import { createOctokit, createStatusOctokit, getReleaseBranches } from '../../github-repo';
import { JiraClient } from '../../jira-client';
import type { GitHubConfig, ValidationCheck } from '../../types/index';
import { JIRA_BASE_URL, SKIP_LABEL } from '../../types/index';
import { safeErrorMessage } from '../../utils';
import { getExpectedVersionForBranch } from '../../version-compare';
import { extractTicketIds } from '../../version-parse';
import { HandledValidationError } from '../pr-path-validation/errors';
import { isLabelAppliedByTrustedActor } from '../pr-path-validation/owners';
import { formatValidationComment, validateTicket } from './validation-checks';

export type JiraValidationInput = {
  baseBranch: string;
  config: GitHubConfig;
  headSha?: string;
  /** Injectable for tests; default to real Octokit clients built from config. */
  octokit?: Octokit;
  prNumber: number;
  prTitle: string;
  statusOctokit?: Octokit;
};

/** Validate Jira tickets referenced in a pull request title. */
export const executeJiraValidation = async (input: JiraValidationInput): Promise<void> => {
  const { baseBranch, config, prNumber, prTitle } = input;
  const octokit = input.octokit ?? createOctokit(config);
  const statusOctokit = input.statusOctokit ?? createStatusOctokit(config);

  const shouldSkip = await hasLabel(octokit, config.owner, config.repo, prNumber, SKIP_LABEL);
  if (shouldSkip) {
    // Presence alone is not enough -- anyone with triage can add the label
    // via the UI. Fail closed when the applier can't be verified as trusted.
    const skipTrusted = await isLabelAppliedByTrustedActor(
      statusOctokit,
      config.owner,
      config.repo,
      prNumber,
      SKIP_LABEL,
      baseBranch,
    );
    if (skipTrusted) {
      console.log(`Label "${SKIP_LABEL}" found (trusted actor), skipping Jira validation.`);
      await reportValidation(
        octokit,
        config.owner,
        config.repo,
        prNumber,
        true,
        `:white_check_mark: **Jira Validation Skipped** — \`${SKIP_LABEL}\` label is present.`,
      );
      return;
    }
    console.log(
      `Label "${SKIP_LABEL}" is present but was not applied by a trusted actor -- ignoring skip.`,
    );
  }

  const ticketIds = extractTicketIds(prTitle);
  if (ticketIds.length === 0) {
    const msg =
      ':x: **Jira Validation Failed**\n\n' +
      'No `CNV-XXXXX` ticket ID found in the PR title.\n\n' +
      'PR titles must start with a Jira ticket ID, e.g.:\n' +
      '- `CNV-12345: Fix the login button`\n' +
      '- `[release-4.21] CNV-12345: Backport fix`\n\n' +
      '> Edit your PR title to include a valid Jira ticket ID, then comment `/recheck-jira`.';

    await reportValidation(octokit, config.owner, config.repo, prNumber, false, msg);
    throw new HandledValidationError('No CNV ticket ID found in PR title');
  }

  const releaseBranches = await getReleaseBranches(octokit, config.owner, config.repo).catch(
    async (err) => {
      const message = `Failed to resolve release branches: ${safeErrorMessage(err)}`;
      throw new HandledValidationError(message);
    },
  );
  const expectedVersion = getExpectedVersionForBranch(baseBranch, releaseBranches);

  if (!process.env.JIRA_TOKEN) {
    throw new HandledValidationError('Missing required environment variable: JIRA_TOKEN');
  }

  const jira = new JiraClient({
    baseUrl: JIRA_BASE_URL,
    projectKey: 'CNV',
    token: process.env.JIRA_TOKEN,
  });

  const allChecks = new Map<string, ValidationCheck[]>();

  for (const ticketKey of ticketIds) {
    const issue = await jira.getIssue(ticketKey).catch((err) => {
      allChecks.set(ticketKey, [
        {
          message: `Could not fetch ticket: ${safeErrorMessage(err)}`,
          name: 'Ticket Exists',
          passed: false,
        },
      ]);
      return null;
    });
    if (!issue) {
      continue;
    }

    const checks = await validateTicket(jira, issue, expectedVersion, baseBranch);
    allChecks.set(ticketKey, checks);
  }

  const allPassed = [...allChecks.values()].every((checks) =>
    checks.every((check) => check.passed),
  );

  const commentBody = formatValidationComment(ticketIds, allChecks, allPassed);
  await reportValidation(octokit, config.owner, config.repo, prNumber, allPassed, commentBody);

  if (!allPassed) {
    throw new HandledValidationError('Jira validation failed. See PR comment for details.');
  }

  console.log('Jira validation passed.');
};
