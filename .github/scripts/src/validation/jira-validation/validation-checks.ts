import { type JiraClient } from '../../jira-client';
import type { JiraIssue, ValidationCheck } from '../../types/index';
import { MIN_STORY_POINTS, REQUIRED_COMPONENT } from '../../types/index';
import { fixVersionMatchesBranch, suggestBranchForFixVersion } from '../../version-compare';
import { extractVersionNumber, parseVersionToNumber } from '../../version-parse';

type FixVersion = { name: string };

const hasFixVersionMatch = (
  fixVersions: FixVersion[],
  expectedVersion: string,
  isMain: boolean,
): boolean =>
  fixVersions.some((ver) => {
    if (!isMain) {
      return fixVersionMatchesBranch(ver, expectedVersion);
    }
    const fvVersion = extractVersionNumber(ver.name);
    return fvVersion
      ? parseVersionToNumber(fvVersion) >= parseVersionToNumber(expectedVersion)
      : false;
  });

const buildFixVersionMismatchMessage = (
  fixVersions: FixVersion[],
  expectedVersion: string,
  baseBranch: string,
  isMain: boolean,
): string => {
  const fvNames = fixVersions.map((ver) => ver.name).join(', ');
  const fvVersion = fixVersions[0] ? extractVersionNumber(fixVersions[0].name) : null;
  const suggestedBranch = fixVersions[0] ? suggestBranchForFixVersion(fixVersions[0].name) : null;
  const suggestion = suggestedBranch
    ? `. Did you mean to target \`${suggestedBranch}\` instead?`
    : '';
  return isMain
    ? `Fix version "${fvNames}" (version ${fvVersion}) is below the minimum for \`main\` (>= ${expectedVersion})${suggestion}`
    : `Fix version "${fvNames}" (version ${fvVersion}) does not match PR target branch \`${baseBranch}\` (expected: ${expectedVersion})${suggestion}`;
};

const validateFixVersion = (
  fixVersions: FixVersion[],
  expectedVersion: null | string,
  baseBranch: string,
): ValidationCheck => {
  if (fixVersions.length === 0) {
    return { message: 'No fix version is set on the ticket', name: 'Fix Version', passed: false };
  }
  if (!expectedVersion) {
    return {
      message: `Fix version set: ${fixVersions.map((ver) => ver.name).join(', ')} (branch alignment check skipped for \`${baseBranch}\`)`,
      name: 'Fix Version',
      passed: true,
    };
  }

  const isMain = baseBranch === 'main';
  if (hasFixVersionMatch(fixVersions, expectedVersion, isMain)) {
    return {
      message: isMain
        ? `Fix version is valid for \`main\` (>= ${expectedVersion})`
        : `Fix version matches target branch \`${baseBranch}\` (expected: ${expectedVersion})`,
      name: 'Fix Version',
      passed: true,
    };
  }

  return {
    message: buildFixVersionMismatchMessage(fixVersions, expectedVersion, baseBranch, isMain),
    name: 'Fix Version',
    passed: false,
  };
};

const resolveStoryPoints = (issue: JiraIssue, spFieldId: string | undefined): null | number => {
  if (!spFieldId) {
    return null;
  }
  const raw = issue.fields[spFieldId as `customfield_${string}`];
  return typeof raw === 'number' ? raw : null;
};

const buildStoryPointsMessage = (storyPoints: null | number): string => {
  if (storyPoints === null) {
    return 'Story points are not set on the ticket';
  }
  if (storyPoints < MIN_STORY_POINTS) {
    return `Story points must be greater than 1 (current: ${storyPoints})`;
  }
  return `Story points: ${storyPoints}`;
};

const resolveActivityTypeSet = (issue: JiraIssue, atFieldId: string | undefined): boolean => {
  if (!atFieldId) {
    return false;
  }
  const raw = issue.fields[atFieldId as `customfield_${string}`];
  return raw !== null && raw !== undefined && raw !== '';
};

const buildActivityTypeMessage = (
  activityTypeSet: boolean,
  atFieldId: string | undefined,
): string => {
  if (activityTypeSet) {
    return 'Activity Type is set';
  }
  if (atFieldId) {
    return 'Activity Type is not set on the ticket';
  }
  return 'Could not discover "Activity Type" custom field';
};

/** Validate story points, fix version, component, and activity type on a Jira ticket. */
export const validateTicket = async (
  jira: JiraClient,
  issue: JiraIssue,
  expectedVersion: null | string,
  baseBranch: string,
): Promise<ValidationCheck[]> => {
  const checks: ValidationCheck[] = [];
  const discoveredFields = await jira.discoverCustomFields();

  const storyPoints = resolveStoryPoints(issue, discoveredFields.storyPointsFieldId ?? undefined);
  checks.push({
    message: buildStoryPointsMessage(storyPoints),
    name: 'Story Points',
    passed: storyPoints !== null && storyPoints >= MIN_STORY_POINTS,
  });

  const fixVersions = issue.fields.fixVersions;
  if (fixVersions.length > 1) {
    checks.push({
      message: `Ticket has ${fixVersions.length} fix versions (${fixVersions.map((ver) => ver.name).join(', ')}). Only 1 fix version is allowed per ticket.`,
      name: 'Fix Version Count',
      passed: false,
    });
  }

  checks.push(validateFixVersion(fixVersions, expectedVersion, baseBranch));

  const hasComponent = issue.fields.components.some(
    (comp) => comp.name.toLowerCase() === REQUIRED_COMPONENT.toLowerCase(),
  );
  checks.push({
    message: hasComponent
      ? `Component "${REQUIRED_COMPONENT}" is set`
      : `Component "${REQUIRED_COMPONENT}" is not set (found: ${issue.fields.components.map((comp) => comp.name).join(', ') || 'none'})`,
    name: 'Component',
    passed: hasComponent,
  });

  const atFieldId = discoveredFields.activityTypeFieldId ?? undefined;
  const activityTypeSet = resolveActivityTypeSet(issue, atFieldId);
  checks.push({
    message: buildActivityTypeMessage(activityTypeSet, atFieldId),
    name: 'Activity Type',
    passed: activityTypeSet,
  });

  return checks;
};

export { formatValidationComment } from './format-comment';
