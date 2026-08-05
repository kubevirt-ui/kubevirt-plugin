import type { Octokit } from '@octokit/rest';

import { isRequiredGatingSuite } from '../shared/is-required-gating-suite';
import { failStep, setOutput } from '../shared/output';

export const VALID_TEST_E2E_PROJECTS = [
  'auto',
  'gating',
  'tier1',
  'tier2',
  'suite',
  'features',
  'settings',
  'api',
  'all',
] as const;

export type TestE2EProject = (typeof VALID_TEST_E2E_PROJECTS)[number];

export type ParsedTestE2ECommand = {
  testArgs: string;
  testProject: TestE2EProject;
};

/** Strip zero-width / bidi marks that GitHub or editors may inject into copied paths. */
export const sanitizeTestE2EArg = (value: string): string =>
  value.replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '');

/** Parse `/test-e2e [suite] [args…]` from a PR comment body (first matching line). */
export const parseTestE2ECommand = (commentBody: string): null | ParsedTestE2ECommand => {
  const line = commentBody
    .split(/\r?\n/)
    .map((entry) => sanitizeTestE2EArg(entry).trim())
    .find((entry) => entry.startsWith('/test-e2e'));
  if (!line) {
    return null;
  }

  const [command, ...tokens] = line.split(/\s+/);
  if (command !== '/test-e2e' || tokens.length === 0) {
    return null;
  }

  const [first, ...rest] = tokens;
  const firstLower = first.toLowerCase();

  if ((VALID_TEST_E2E_PROJECTS as readonly string[]).includes(firstLower)) {
    return {
      testArgs: rest.join(' '),
      testProject: firstLower as TestE2EProject,
    };
  }

  // Suite omitted: treat everything as Playwright args with auto project
  return {
    testArgs: tokens.join(' '),
    testProject: 'auto',
  };
};

/** Build the comment body for a successful /test-e2e dispatch. */
export const buildTestE2EReport = (
  owner: string,
  repo: string,
  testProject: string,
  testArgs: string,
): string => {
  const suiteLabel = testArgs ? `\`${testProject}\` with \`${testArgs}\`` : `\`${testProject}\``;
  const lines = [`🚀 \`/test-e2e\` dispatched Hot Cluster E2E for ${suiteLabel} on this PR.`, ''];

  if (!isRequiredGatingSuite(testProject, testArgs)) {
    lines.push(
      '> This is an ad-hoc suite run — it does **not** update the required **Run Gating Tests** check.',
      '',
    );
  }

  lines.push(
    `Track progress in the [Actions tab](https://github.com/${owner}/${repo}/actions/workflows/hot-cluster-e2e.yml).`,
  );
  return lines.join('\n');
};

/** Report an unexpected error for /test-e2e. */
export const reportTestE2EError = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  message: string,
): Promise<void> => {
  setOutput('unexpected_error', 'true');
  setOutput('error_message', message);

  try {
    await octokit.issues.createComment({
      body: `⚠️ \`/test-e2e\` hit an unexpected error:\n\n\`\`\`\n${message}\n\`\`\``,
      issue_number: prNumber,
      owner,
      repo,
    });
  } catch {
    /* best effort */
  }

  failStep(message);
};
