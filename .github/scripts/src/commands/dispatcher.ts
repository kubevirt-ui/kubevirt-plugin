/**
 * Unified PR Command Dispatcher.
 *
 * Single entry point for ALL issue_comment PR commands.
 * Handles: bot filtering, command matching, OWNERS trust check,
 * routing to the appropriate handler, and signaling downstream
 * YAML jobs (for concurrency-group cancellation).
 *
 * Every exit path is exit(0) — the GitHub UI always shows green.
 *
 * Required env: COMMENT_BODY, COMMENT_AUTHOR, COMMENT_ID, PR_NUMBER,
 *               BOT_TOKEN, GITHUB_TOKEN, GITHUB_REPOSITORY
 * Optional env: JIRA_TOKEN (for /clone and /recheck-jira)
 */

import { resolve } from 'node:path';

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { setOutput } from '../shared/output';
import { isListedInLocalOwners } from '../shared/owners';
import { COMMANDS } from './command-registry';

export type { CommandContext } from './command-registry';

const main = async (): Promise<void> => {
  const commentBody = process.env.COMMENT_BODY ?? '';
  const author = process.env.COMMENT_AUTHOR ?? '';

  if (author.endsWith('[bot]')) {
    console.log(`Bot comment from ${author} — skipping.`);
    return;
  }

  const matched = COMMANDS.find((cmd) => cmd.pattern.test(commentBody));
  if (!matched) {
    console.log('No PR command matched — exiting successfully.');
    return;
  }

  console.log(`Matched command: ${matched.name} (from ${author})`);
  setOutput('command', matched.name);

  const token = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const octokit = new Octokit({ auth: token });

  const ctx = { author, commentBody, commentId, octokit, owner, prNumber, repo };

  if (matched.requiresTrust) {
    const workspace = process.env.GITHUB_WORKSPACE ?? resolve(process.cwd(), '../..');
    const trusted = isListedInLocalOwners(author, resolve(workspace, 'OWNERS'));
    const trustStatus = trusted ? 'trusted' : `untrusted, ignoring ${matched.name}`;
    console.log(`${author} is ${trusted ? '' : 'not '}listed in OWNERS — ${trustStatus}.`);

    if (!trusted) {
      await reactToComment(octokit, owner, repo, commentId, '-1');
      console.log(`Untrusted author ${author} for /${matched.name} — exiting successfully.`);
      return;
    }
  }

  try {
    await matched.execute(ctx);
    console.log(`Command ${matched.name} completed successfully.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Command ${matched.name} failed: ${msg}`);

    try {
      await octokit.issues.createComment({
        body: `⚠️ \`/${matched.name}\` hit an unexpected error:\n\n\`\`\`\n${msg}\n\`\`\``,
        issue_number: prNumber,
        owner,
        repo,
      });
    } catch {
      /* best effort */
    }
  }
};

void main().catch((err) => {
  console.error(`Dispatcher crash: ${err instanceof Error ? err.message : String(err)}`);
});
