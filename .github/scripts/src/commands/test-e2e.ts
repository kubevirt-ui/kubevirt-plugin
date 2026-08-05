/**
 * /test-e2e command — dispatch Hot Cluster E2E for a chosen suite (and optional
 * Playwright filter) against this PR. Does not replace /retest-e2e (gating) and
 * does not publish the required "Run Gating Tests" check for non-gating suites.
 *
 * Usage:
 *   /test-e2e tier1
 *   /test-e2e tier2
 *   /test-e2e suite
 *   /test-e2e tier1 playwright/tests/tier1/foo.spec.ts
 *   /test-e2e playwright/tests/tier1/foo.spec.ts
 *   /test-e2e gating -g MyTestName
 *   /test-e2e -g "creates a bootable volume"
 *   /test-e2e tier1 -g "VM Search Language"
 *
 * Entry point: npx tsx src/commands/test-e2e.ts
 *
 * Required env: BOT_TOKEN|GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER,
 *               COMMENT_ID, COMMENT_AUTHOR, TRUSTED, COMMENT_BODY
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { enforceCommentTrust, reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep } from '../shared/output';
import type { CommandContext } from './command-registry';
import {
  buildTestE2EReport,
  parseTestE2ECommand,
  reportTestE2EError,
  VALID_TEST_E2E_PROJECTS,
} from './test-e2e-helpers';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const commentBody = requireEnv('COMMENT_BODY');
  const octokit = new Octokit({ auth: token });

  try {
    if (
      !(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/test-e2e'))
    ) {
      return;
    }

    const parsed = parseTestE2ECommand(commentBody);
    if (!parsed || (parsed.testProject === 'auto' && !parsed.testArgs.trim())) {
      await octokit.issues.createComment({
        body: [
          '⚠️ `/test-e2e` needs a suite name, or a Playwright filter (spec path / `-g`).',
          '',
          'Usage:',
          '- `/test-e2e <suite> [playwright-args…]`',
          '- `/test-e2e <spec-path>`',
          '- `/test-e2e -g "test title"`',
          '',
          `Suites: \`${VALID_TEST_E2E_PROJECTS.join('` · `')}\``,
          '',
          'Examples:',
          '- `/test-e2e tier1`',
          '- `/test-e2e tier2`',
          '- `/test-e2e suite`',
          '- `/test-e2e tier1 playwright/tests/tier1/foo.spec.ts`',
          '- `/test-e2e playwright/tests/tier1/bootable-volumes/bootable-volumes.spec.ts`',
          '- `/test-e2e gating -g MyTestName`',
          '- `/test-e2e -g "creates a bootable volume"`',
          '- `/test-e2e tier1 -g "VM Search Language"`',
        ].join('\n'),
        issue_number: prNumber,
        owner,
        repo,
      });
      return;
    }

    const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    const headSha = pullRequest.head.sha;
    const baseRef = pullRequest.base.ref;

    const suiteArgs = parsed.testArgs ? ` ${parsed.testArgs}` : '';
    console.log(
      `/test-e2e ${parsed.testProject}${suiteArgs} ` +
        `requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`,
    );

    await reactToComment(octokit, owner, repo, commentId, 'rocket');

    await dispatchWorkflow(octokit, {
      inputs: {
        base_ref: baseRef,
        pr_number: String(prNumber),
        skip_pool_check: 'true',
        test_args: parsed.testArgs,
        test_project: parsed.testProject,
      },
      owner,
      ref: 'main',
      repo,
      workflowId: 'hot-cluster-e2e.yml',
    });

    const body = buildTestE2EReport(owner, repo, parsed.testProject, parsed.testArgs);
    try {
      await octokit.issues.createComment({ body, issue_number: prNumber, owner, repo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await reportTestE2EError(octokit, owner, repo, prNumber, msg);
  }
};

export const executeTestE2E = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.TRUSTED = 'true';
  await main();
};

if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
