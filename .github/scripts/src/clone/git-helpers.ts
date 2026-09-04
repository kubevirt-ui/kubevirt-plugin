import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const GIT_USER_NAME = 'github-actions[bot]';
const GIT_USER_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';

/** Thrown when a git command fails; carries stderr for PR feedback. */
export class GitCommandError extends Error {
  readonly command: string;
  readonly stderr: string;

  constructor(command: string, stderr: string) {
    const detail = stderr.trim() || 'unknown error';
    super(`git ${command} failed: ${detail}`);
    this.name = 'GitCommandError';
    this.command = command;
    this.stderr = detail;
  }
}

/** Repository root (GITHUB_WORKSPACE in Actions; two levels up from .github/scripts locally). */
export const getRepoRoot = (): string =>
  process.env.GITHUB_WORKSPACE ?? resolve(process.cwd(), '../..');

/** Build cherry-pick args: `-m 1` only for merge commits. */
export const buildCherryPickArgs = (commitSha: string, isMerge: boolean): string[] =>
  isMerge
    ? ['cherry-pick', '-m', '1', commitSha, '--allow-empty']
    : ['cherry-pick', commitSha, '--allow-empty'];

/** Configure git identity, authenticated remote, and fetch refs needed for cherry-pick. */
export const setupRepositoryForCherryPick = (params: {
  commitSha: string;
  owner: string;
  repo: string;
  targetBranch: string;
  token: string;
}): void => {
  const { commitSha, owner, repo, targetBranch, token } = params;
  const remote = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;

  git('config', 'user.name', GIT_USER_NAME);
  git('config', 'user.email', GIT_USER_EMAIL);

  try {
    git('remote', 'get-url', 'origin');
    git('remote', 'set-url', 'origin', remote);
  } catch {
    git('remote', 'add', 'origin', remote);
  }

  gitSafe('fetch', 'origin', '--unshallow');
  git('fetch', 'origin', targetBranch);
  git('fetch', 'origin', commitSha);
};

/** Run a git command in the repository root, returning trimmed stdout. */
export const git = (...args: string[]): string => {
  try {
    return execFileSync('git', args, {
      cwd: getRepoRoot(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (err: unknown) {
    const nodeErr = err as { message?: string; stderr?: Buffer | string };
    const stderr =
      nodeErr.stderr !== undefined && nodeErr.stderr !== ''
        ? String(nodeErr.stderr)
        : (nodeErr.message ?? 'unknown error');
    throw new GitCommandError(args.join(' '), stderr);
  }
};

/** Run a git command, returning empty string on failure. */
export const gitSafe = (...args: string[]): string => {
  try {
    return git(...args);
  } catch {
    return '';
  }
};

/** True when the commit has more than one parent (merge commit). */
export const isMergeCommit = (commitSha: string): boolean => {
  const parents = gitSafe('rev-list', '--parents', '-n', '1', commitSha);
  return parents.split(' ').filter(Boolean).length > 2;
};
