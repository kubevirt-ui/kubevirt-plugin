/**
 * /help command handler — posts a table of available PR commands.
 * Entry point: npx tsx src/commands/help.ts
 *
 * Required env: GITHUB_TOKEN or BOT_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, COMMENT_BODY
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep, setOutput } from '../shared/output';

type CommandEntry = {
  command: string;
  description: string;
  trust: string;
};

const TRUST_LABELS: Record<string, string> = {
  collaborator: 'Any collaborator (write access)',
  'github-owners': '.github/OWNERS only',
  'member-or-owner': 'Member/owner/collaborator',
  none: 'Anyone',
  owners: 'OWNERS only',
};

import type { CommandContext } from './dispatcher';

/** Called by the dispatcher when /help is matched. */
export const executeHelp = async (ctx: CommandContext): Promise<void> => {
  const workspace = process.env.GITHUB_WORKSPACE ?? resolve(process.cwd(), '../..');
  const { commands } = JSON.parse(
    readFileSync(resolve(workspace, '.github/pr-commands.json'), 'utf8'),
  ) as {
    commands: CommandEntry[];
  };

  const rows = commands.map(
    (cmd) =>
      `| \`${cmd.command}\` | ${cmd.description} | ${TRUST_LABELS[cmd.trust] ?? cmd.trust} |`,
  );

  const body = [
    '### Available PR commands',
    '',
    '| Command | Description | Who can use it |',
    '|---|---|---|',
    ...rows,
  ].join('\n');

  await ctx.octokit.issues.createComment({
    body,
    issue_number: ctx.prNumber,
    owner: ctx.owner,
    repo: ctx.repo,
  });
};

// Standalone entry point (backward compat)
if (require.main === module) {
  const main = async (): Promise<void> => {
    const commentBody = process.env.COMMENT_BODY ?? '';
    const matched = /(^|\s)\/help(\s|$)/.test(commentBody);
    setOutput('matched', matched ? 'true' : 'false');
    if (!matched) {
      return;
    }

    const token = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
    const { owner, repo } = getRepoContext();
    const prNumber = Number(requireEnv('PR_NUMBER'));
    const octokit = new Octokit({ auth: token });
    await executeHelp({ author: '', commentBody, commentId: 0, octokit, owner, prNumber, repo });
  };
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
