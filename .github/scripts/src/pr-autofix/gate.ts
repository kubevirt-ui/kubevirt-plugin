// @ai-rules:
// 1. [Constraint]: Shared by both jobs. The `fix` job has PR code present and NO Jira/bot secrets.
// 2. [Gotcha]: Always use git() (hooks/fsmonitor off); secrets go through authEnv, never argv.

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import { Octokit } from '@octokit/rest';

import { getRepoContext, getRunAttempt } from '../shared/actions-context';
import { setOutput } from '../shared/output';
import { isListedInLocalOwners, resolveTrustLogin } from '../shared/owners';
import { requireEnv } from '../utils';
import type { PolicyContext } from './policy';
import { buildSummary, evaluatePolicy, isForbiddenPath, isTrustedAuthor } from './policy';

/** Agent/editor config a PR could use to steer the AI (any depth, any case). */
const AGENT_CONFIG =
  /^(\.cursor|\.cursorrules|\.cursorignore|agents\.md|claude\.md|\.claude|\.codex|\.gemini|\.windsurf|\.mcp\.json)$/i;

type GitOptions = { env?: Record<string, string>; input?: string };

/** git with hooks and fsmonitor disabled. */
export const git = (cwd: string, args: string[], { env, input }: GitOptions = {}): string => {
  const safe = ['-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null'];
  const result = spawnSync('git', [...safe, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...env },
    input,
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git failed (${result.status}): ${result.stderr.trim().slice(0, 500)}`);
  }
  return result.stdout;
};

/** Env-based git credential header, so the token never appears in argv or the remote URL. */
export const authEnv = (token: string): Record<string, string> => {
  const header = Buffer.from(`x-access-token:${token}`).toString('base64');
  console.log(`::add-mask::${header}`);
  return {
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${header}`,
  };
};

/** Fail unless whoever triggered the run is listed in the given (default-branch) OWNERS file. */
export const assertTriggerTrusted = (ownersPath: string): void => {
  const { GITHUB_ACTOR = '', GITHUB_TRIGGERING_ACTOR, TRIGGERED_BY = '' } = process.env;
  const login = resolveTrustLogin(GITHUB_ACTOR, TRIGGERED_BY, {
    runAttempt: getRunAttempt(),
    triggeringActor: GITHUB_TRIGGERING_ACTOR,
  });
  if (!isListedInLocalOwners(login, ownersPath)) {
    throw new Error(`${login || 'unknown user'} is not in the root OWNERS; refusing to run.`);
  }
};

/** Delete nested agent config. Symlinks are removed as links and never followed. */
export const neutralizeAgentConfigs = (root: string): string[] => {
  const removed: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (AGENT_CONFIG.test(entry.name)) {
        fs.rmSync(path, { force: true, recursive: true });
        removed.push(relative(root, path));
      } else if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) {
        walk(path);
      }
    }
  };
  walk(root);
  return removed;
};

/** Apply a patch to a temp index of `head` (cwd = default-branch checkout) and gate the TREE diff. */
export const gatePatch = (head: string, patchFile: string, ctx: PolicyContext) => {
  const env = { GIT_INDEX_FILE: join(fs.mkdtempSync(join(tmpdir(), 'autofix-')), 'index') };
  const cwd = process.env.GITHUB_WORKSPACE ?? process.cwd();
  git(cwd, ['read-tree', head], { env });
  try {
    git(cwd, ['apply', '--cached', '--whitespace=nowarn', patchFile], { env });
  } catch {
    return { problems: ['patch does not apply cleanly to the PR head'], tree: '' };
  }
  const tree = git(cwd, ['write-tree'], { env }).trim();
  const flags = ['--no-renames', '--no-ext-diff', '--no-textconv', '--no-color'];
  const raw = ['diff-tree', '-r', '-z', '--raw', '--no-abbrev', '--no-renames'];
  const patch = buildSummary(
    git(cwd, [...raw, head, tree]),
    git(cwd, ['diff', '--numstat', ...flags, head, tree]),
    git(cwd, ['diff', '-U0', ...flags, head, tree]),
  );
  return { problems: evaluatePolicy(patch, ctx), tree };
};

const PR_DIR = process.env.PR_DIR ?? 'pr';
const OUT_DIR = process.env.OUT_DIR ?? 'out';

/** Trust check, agent-config neutralization, baseline commit and the lintable PR file list. */
const prepare = async (): Promise<void> => {
  const { owner, repo } = getRepoContext();
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const pull_number = Number(requireEnv('PR_NUMBER'));
  const params = { owner, pull_number, repo };
  const { data: pr } = await octokit.pulls.get(params);
  const head = git(PR_DIR, ['rev-parse', 'HEAD']).trim();
  if (head !== pr.head.sha) throw new Error('PR head moved since checkout; run /autofix again.');
  const ownersFile = requireEnv('OWNERS_FILE');
  assertTriggerTrusted(ownersFile);
  const trusted = isTrustedAuthor(pr.user?.login ?? '', fs.readFileSync(ownersFile, 'utf8'));
  console.log(`Removed agent config: ${neutralizeAgentConfigs(PR_DIR).join(', ') || 'none'}`);
  git(PR_DIR, ['add', '-A']);
  const identity = ['-c', 'user.name=autofix', '-c', 'user.email=autofix@localhost'];
  git(PR_DIR, [...identity, 'commit', '-q', '--allow-empty', '--no-verify', '-m', 'baseline']);
  const listed = await octokit.paginate(octokit.pulls.listFiles, { ...params, per_page: 100 });
  const files = listed
    .filter(({ filename, status }) => status !== 'removed' && /\.[cm]?[jt]sx?$/.test(filename))
    .filter(({ filename }) => !isForbiddenPath(filename))
    .filter(({ filename }) =>
      fs.lstatSync(join(PR_DIR, filename), { throwIfNoEntry: false })?.isFile(),
    )
    .map(({ filename }) => `./${filename}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(join(OUT_DIR, 'files.txt'), files.join('\n'));
  setOutput('head_sha', head);
  setOutput('trusted', String(trusted));
  console.log(`Author trusted: ${trusted}; ${files.length} lintable file(s).`);
};

/** Capture the cumulative diff against the baseline commit as `<name>.patch` (data only). */
const capture = (name: string): void => {
  git(PR_DIR, ['add', '-A']);
  const flags = ['--cached', '--no-ext-diff', '--no-textconv', '--no-color'];
  fs.writeFileSync(join(OUT_DIR, `${name}.patch`), git(PR_DIR, ['diff', ...flags, 'HEAD']));
};

if (require.main === module) {
  const [, , command, name = ''] = process.argv;
  Promise.resolve(command === 'capture' ? capture(name) : prepare()).catch((err: unknown) => {
    console.error(`::error::${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
