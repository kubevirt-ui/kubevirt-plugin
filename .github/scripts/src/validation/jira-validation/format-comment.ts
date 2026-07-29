import type { ValidationCheck } from '../../types/index';
import { JIRA_BASE_URL } from '../../types/index';

/** Format the Jira validation PR comment from check results. */
export const formatValidationComment = (
  ticketIds: string[],
  allChecks: Map<string, ValidationCheck[]>,
  allPassed: boolean,
): string => {
  const icon = allPassed ? ':white_check_mark:' : ':x:';
  const status = allPassed ? 'Passed' : 'Failed';
  const lines: string[] = [`${icon} **Jira Validation ${status}**`, ''];

  for (const ticketId of ticketIds) {
    const checks = allChecks.get(ticketId);
    if (!checks) continue;

    lines.push(
      `### [${ticketId}](${JIRA_BASE_URL}/browse/${ticketId})`,
      '',
      '| Check | Status | Details |',
      '|-------|--------|---------|',
    );

    for (const check of checks) {
      const checkIcon = check.passed ? ':white_check_mark:' : ':x:';
      lines.push(`| ${check.name} | ${checkIcon} | ${check.message} |`);
    }
    lines.push('');
  }

  if (!allPassed) {
    lines.push('> Fix the issues above, then comment `/recheck-jira` to re-run validation.');
  }

  return lines.join('\n');
};
