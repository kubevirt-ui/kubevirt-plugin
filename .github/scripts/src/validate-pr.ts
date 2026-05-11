import { JiraClient } from './jira-client.js';
import { createOctokit, getReleaseBranches } from './github-repo.js';
import { hasLabel, reportValidation } from './github-comments.js';
import { extractTicketIds, getExpectedVersionForBranch } from './version-utils.js';
import { validateTicket, formatValidationComment } from './validation-checks.js';
import { requireEnv, safeErrorMessage } from './utils.js';
import { JIRA_BASE_URL, SKIP_LABEL } from './types/index.js';
import type { GitHubConfig, JiraIssue, ValidationCheck } from './types/index.js';

/** Entrypoint: extract ticket IDs from PR title and validate each against Jira. */
const main = async (): Promise<void> => {
  const ghConfig: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const baseBranch = requireEnv('BASE_BRANCH');
  const octokit = createOctokit(ghConfig);

  const shouldSkip = await hasLabel(octokit, ghConfig.owner, ghConfig.repo, prNumber, SKIP_LABEL);
  if (shouldSkip) {
    console.log(`Label "${SKIP_LABEL}" found, skipping Jira validation.`);
    await reportValidation(
      octokit, ghConfig.owner, ghConfig.repo, prNumber, true,
      `:white_check_mark: **Jira Validation Skipped** — \`${SKIP_LABEL}\` label is present.`,
    );
    return;
  }

  const ticketIds = extractTicketIds(prTitle);
  if (ticketIds.length === 0) {
    const msg =
      ':x: **Jira Validation Failed**\n\n' +
      'No `CNV-XXXXX` ticket ID found in the PR title.\n\n' +
      'PR titles must start with a Jira ticket ID, e.g.:\n' +
      '- `CNV-12345: Fix the login button`\n' +
      '- `[release-4.21] CNV-12345: Backport fix`\n\n' +
      '> Edit your PR title to include a valid Jira ticket ID.';

    await reportValidation(octokit, ghConfig.owner, ghConfig.repo, prNumber, false, msg);
    process.exit(1);
  }

  const releaseBranches = await getReleaseBranches(octokit, ghConfig.owner, ghConfig.repo);
  const expectedVersion = getExpectedVersionForBranch(baseBranch, releaseBranches);

  const jira = new JiraClient({
    baseUrl: JIRA_BASE_URL,
    token: requireEnv('JIRA_TOKEN'),
    projectKey: 'CNV',
  });

  const allChecks = new Map<string, ValidationCheck[]>();
  let allPassed = true;

  for (const ticketKey of ticketIds) {
    let issue: JiraIssue;
    try {
      issue = await jira.getIssue(ticketKey);
    } catch (err) {
      allChecks.set(ticketKey, [
        { name: 'Ticket Exists', passed: false, message: `Could not fetch ticket: ${safeErrorMessage(err)}` },
      ]);
      allPassed = false;
      continue;
    }

    const checks = await validateTicket(jira, issue, expectedVersion, baseBranch);
    allChecks.set(ticketKey, checks);

    if (checks.some((c) => !c.passed)) {
      allPassed = false;
    }
  }

  const commentBody = formatValidationComment(ticketIds, allChecks, allPassed);
  await reportValidation(octokit, ghConfig.owner, ghConfig.repo, prNumber, allPassed, commentBody);

  if (!allPassed) {
    console.error('Jira validation failed. See PR comment for details.');
    process.exit(1);
  }

  console.log('Jira validation passed.');
};

main().catch((err) => {
  console.error('Unexpected error:', safeErrorMessage(err));
  process.exit(1);
});
