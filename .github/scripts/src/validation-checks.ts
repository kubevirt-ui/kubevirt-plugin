/* eslint-disable no-nested-ternary */
import { JiraClient } from './jira-client.js';
import {
  extractVersionNumber,
  fixVersionMatchesBranch,
  suggestBranchForFixVersion,
} from './version-utils.js';
import { JIRA_BASE_URL, MIN_STORY_POINTS, REQUIRED_COMPONENT } from './types/index.js';
import type { JiraIssue, ValidationCheck } from './types/index.js';

/** Validate story points, fix version, component, and activity type on a Jira ticket. */
export const validateTicket = async (
  jira: JiraClient,
  issue: JiraIssue,
  expectedVersion: string | null,
  baseBranch: string,
): Promise<ValidationCheck[]> => {
  const checks: ValidationCheck[] = [];
  const discoveredFields = await jira.discoverCustomFields();

  const spFieldId = discoveredFields.storyPointsFieldId;
  let storyPoints: number | null = null;
  if (spFieldId) {
    const raw = issue.fields[spFieldId as `customfield_${string}`];
    storyPoints = typeof raw === 'number' ? raw : null;
  }
  checks.push({
    name: 'Story Points',
    passed: storyPoints !== null && storyPoints >= MIN_STORY_POINTS,
    message:
      storyPoints === null
        ? 'Story points are not set on the ticket'
        : storyPoints < MIN_STORY_POINTS
          ? `Story points must be greater than 1 (current: ${storyPoints})`
          : `Story points: ${storyPoints}`,
  });

  const fixVersions = issue.fields.fixVersions;
  if (fixVersions.length === 0) {
    checks.push({
      name: 'Fix Version',
      passed: false,
      message: 'No fix version is set on the ticket',
    });
  } else if (expectedVersion) {
    const hasMatch = fixVersions.some((fv) => fixVersionMatchesBranch(fv, expectedVersion));
    if (hasMatch) {
      checks.push({
        name: 'Fix Version',
        passed: true,
        message: `Fix version matches target branch \`${baseBranch}\` (expected: ${expectedVersion})`,
      });
    } else {
      const fvNames = fixVersions.map((fv) => fv.name).join(', ');
      const fvVersion = extractVersionNumber(fixVersions[0]!.name);
      const suggestedBranch = fixVersions[0]
        ? suggestBranchForFixVersion(fixVersions[0].name)
        : null;
      const suggestion = suggestedBranch
        ? `. Did you mean to target \`${suggestedBranch}\` instead?`
        : '';
      checks.push({
        name: 'Fix Version',
        passed: false,
        message: `Fix version "${fvNames}" (version ${fvVersion}) does not match PR target branch \`${baseBranch}\` (expected: ${expectedVersion})${suggestion}`,
      });
    }
  } else {
    checks.push({
      name: 'Fix Version',
      passed: true,
      message: `Fix version set: ${fixVersions.map((fv) => fv.name).join(', ')} (branch alignment check skipped for \`${baseBranch}\`)`,
    });
  }

  const hasComponent = issue.fields.components.some(
    (c) => c.name.toLowerCase() === REQUIRED_COMPONENT.toLowerCase(),
  );
  checks.push({
    name: 'Component',
    passed: hasComponent,
    message: hasComponent
      ? `Component "${REQUIRED_COMPONENT}" is set`
      : `Component "${REQUIRED_COMPONENT}" is not set (found: ${issue.fields.components.map((c) => c.name).join(', ') || 'none'})`,
  });

  const atFieldId = discoveredFields.activityTypeFieldId;
  let activityTypeSet = false;
  if (atFieldId) {
    const raw = issue.fields[atFieldId as `customfield_${string}`];
    activityTypeSet = raw != null && raw !== '';
  }
  checks.push({
    name: 'Activity Type',
    passed: activityTypeSet,
    message: activityTypeSet
      ? 'Activity Type is set'
      : atFieldId
        ? 'Activity Type is not set on the ticket'
        : 'Could not discover "Activity Type" custom field',
  });

  return checks;
};

/** Format validation results as a markdown table for the PR comment. */
export const formatValidationComment = (
  ticketIds: string[],
  allChecks: Map<string, ValidationCheck[]>,
  allPassed: boolean,
): string => {
  const icon = allPassed ? ':white_check_mark:' : ':x:';
  const title = allPassed
    ? `${icon} **Jira Validation Passed**`
    : `${icon} **Jira Validation Failed**`;
  const lines: string[] = [title, ''];

  for (const [ticketKey, checks] of allChecks) {
    lines.push(`### [${ticketKey}](${JIRA_BASE_URL}/browse/${ticketKey})`, '');
    lines.push('| Check | Status | Details |', '|-------|--------|---------|');
    for (const check of checks) {
      const statusIcon = check.passed ? ':white_check_mark:' : ':x:';
      lines.push(`| ${check.name} | ${statusIcon} | ${check.message} |`);
    }
    lines.push('');
  }

  if (!allPassed) {
    lines.push('---');
    lines.push(
      '> Fix the issues above in Jira, then push a new commit or re-edit the PR title to re-run validation.',
    );
  }

  return lines.join('\n');
};
