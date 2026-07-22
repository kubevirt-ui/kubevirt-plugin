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
import { isListedInLocalOwners } from '../shared/owners';
import { reactToComment } from '../shared/command-helpers';
import { setOutput } from '../shared/output';

export type CommandContext = {
  octokit: Octokit;
  owner: string;
  repo: string;
  prNumber: number;
  commentId: number;
  author: string;
  commentBody: string;
};

type Command = {
  pattern: RegExp;
  name: string;
  requiresTrust: boolean;
  execute: (ctx: CommandContext) => Promise<void>;
};

// Lazy imports — each handler is only loaded when its command matches
const COMMANDS: Command[] = [
  {
    pattern: /(^|\s)\/retest-e2e(\s|$)/,
    name: 'retest-e2e',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeRetestE2E } = await import('./retest-e2e');
      await executeRetestE2E(ctx);
    },
  },
  {
    pattern: /(^|\s)\/retest-failed(\s|$)/,
    name: 'retest-failed',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeRetestFailed } = await import('./retest-failed');
      await executeRetestFailed(ctx);
    },
  },
  {
    pattern: /(^|\s)\/cancel-e2e(\s|$)/,
    name: 'cancel-e2e',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeCancelE2E } = await import('./cancel-e2e');
      await executeCancelE2E(ctx);
      setOutput('needs_cancel', 'true');
    },
  },
  {
    pattern: /(^|\s)\/hold-e2e(\s|$)/,
    name: 'hold-e2e',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeHoldE2E } = await import('./hold-e2e');
      const headSha = await executeHoldE2E(ctx);
      setOutput('needs_cancel', 'true');
      setOutput('needs_hold_mark', 'true');
      if (headSha) setOutput('head_sha', headSha);
    },
  },
  {
    pattern: /(^|\s)\/deploy-manual-console(\s|$)/,
    name: 'deploy-console',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeDeployConsole } = await import('./deploy-manual-console-dispatch');
      await executeDeployConsole(ctx);
    },
  },
  {
    pattern: /(^|\s)\/cleanup-manual-console(\s|$)/,
    name: 'cleanup-console',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeCleanupConsole } = await import('./cleanup-manual-console-dispatch');
      await executeCleanupConsole(ctx);
    },
  },
  {
    pattern: /(^|\s)\/clone(\s|$)/,
    name: 'clone',
    requiresTrust: false,
    execute: async (ctx) => {
      const { executeClone } = await import('./clone-handler');
      await executeClone(ctx);
    },
  },
  {
    pattern: /(^|\s)\/help(\s|$)/,
    name: 'help',
    requiresTrust: false,
    execute: async (ctx) => {
      const { executeHelp } = await import('./help');
      await executeHelp(ctx);
    },
  },
  {
    pattern: /(^|\s)\/(lgtm|approve|hold|recheck-jira|ai-approved|ci-approved)(\s|$)/,
    name: 'validation',
    requiresTrust: true,
    execute: async (ctx) => {
      const { executeValidationCommand } = await import('./validation-handler');
      await executeValidationCommand(ctx);
    },
  },
];

const main = async (): Promise<void> => {
  const commentBody = process.env.COMMENT_BODY ?? '';
  const author = process.env.COMMENT_AUTHOR ?? '';

  // Bot filter — exit successfully, no output
  if (author.endsWith('[bot]')) {
    console.log(`Bot comment from ${author} — skipping.`);
    return;
  }

  // Command match — first match wins
  const matched = COMMANDS.find((cmd) => cmd.pattern.test(commentBody));
  if (!matched) {
    console.log('No PR command matched — exiting successfully.');
    return;
  }

  console.log(`Matched command: ${matched.name} (from ${author})`);
  setOutput('command', matched.name);

  // Build context
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const octokit = new Octokit({ auth: token });

  const ctx: CommandContext = { octokit, owner, repo, prNumber, commentId, author, commentBody };

  // Trust check (if required)
  if (matched.requiresTrust) {
    const workspace = process.env.GITHUB_WORKSPACE || resolve(process.cwd(), '../..');
    const trusted = isListedInLocalOwners(author, resolve(workspace, 'OWNERS'));
    console.log(
      `${author} is ${trusted ? '' : 'not '}listed in OWNERS — ${trusted ? 'trusted' : `untrusted, ignoring ${matched.name}`}.`,
    );

    if (!trusted) {
      await reactToComment(octokit, owner, repo, commentId, '-1');
      console.log(`Untrusted author ${author} for /${matched.name} — exiting successfully.`);
      return;
    }
  }

  // Execute the handler
  try {
    await matched.execute(ctx);
    console.log(`Command ${matched.name} completed successfully.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Command ${matched.name} failed: ${msg}`);

    // Report error on PR (best effort)
    try {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `⚠️ \`/${matched.name}\` hit an unexpected error:\n\n\`\`\`\n${msg}\n\`\`\``,
      });
    } catch {
      /* best effort */
    }

    // Still exit 0 — the error is reported via comment, not via workflow failure
  }
};

main().catch((err) => {
  // Even top-level crashes exit 0 — we never want the PR check to show red
  // for a command dispatcher issue (that would block merge)
  console.error(`Dispatcher crash: ${err instanceof Error ? err.message : String(err)}`);
});
