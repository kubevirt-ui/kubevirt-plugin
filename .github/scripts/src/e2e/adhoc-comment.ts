/**
 * Builds the PR comment posted for a non-gating ("ad-hoc") Hot Cluster E2E
 * suite run. Keeps the title short (suite name only -- never the raw
 * `test_args`, which for the changed-tests auto-dispatch can be a long list
 * of spec paths) and lets the JUnit-derived pass/fail breakdown carry the
 * per-spec detail instead.
 */

export type AdHocCommentParams = {
  passed: boolean;
  runUrl: string;
  testArgs: string;
  testFailureSummary: string;
  testProject: string;
};

const NO_SUMMARY_MESSAGE = '_Test result breakdown unavailable (no JUnit results found)._';

/** `test_args` is a `-g "pattern"` filter rather than one or more spec paths. */
const isFilterArg = (testArgs: string): boolean => /^-g\b/.test(testArgs);

/** Build the PR comment body reporting an ad-hoc Hot Cluster E2E suite result. */
export const buildAdHocResultComment = (params: AdHocCommentParams): string => {
  const { passed, runUrl, testArgs, testFailureSummary, testProject } = params;
  const emoji = passed ? '✅' : '❌';
  const trimmedArgs = testArgs.trim();

  const lines = [
    `${emoji} Hot Cluster E2E ad-hoc suite \`${testProject}\` ${passed ? 'passed' : 'failed'}.`,
  ];

  if (trimmedArgs && isFilterArg(trimmedArgs)) {
    lines.push('', `Filter: \`${trimmedArgs}\``);
  }

  lines.push('', testFailureSummary.trim() || NO_SUMMARY_MESSAGE, '', `[View run](${runUrl})`);

  return lines.join('\n');
};
