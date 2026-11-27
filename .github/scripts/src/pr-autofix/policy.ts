// @ai-rules:
// 1. [Constraint]: Pure functions only (no I/O). The gate must stay deterministic and unit-testable.
// 2. [Gotcha]: Patches come from a job that ran PR code -- treat every input as hostile data.

import { parseOwnersFile } from '../shared/owners';

/** Size caps. The prompt cap bounds untrusted log text sent to the AI provider. */
export const LIMITS = { maxFiles: 10, maxLines: 200, promptBytes: 100 * 1024 } as const;

/** Paths an autofix may never touch (the same set that trips the do-not-merge path gates). */
const FORBIDDEN_PATHS: RegExp[] = [
  /^(locales|\.github|\.cursor|\.claude|\.codex|\.gemini|\.windsurf|\.vscode)\//,
  /(^|\/)(\.cursorrules|\.cursorignore|\.mcp\.json|AGENTS\.md|CLAUDE\.md|OWNERS)$/,
  /(^|\/)(package\.json|package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml)$/,
];

export const isForbiddenPath = (path: string): boolean =>
  FORBIDDEN_PATHS.some((pattern) => pattern.test(path));

/** Added lines that silence a check instead of fixing it. */
const ANTI_CHEAT: RegExp[] = [
  /\.(skip|only)\b/,
  /\b(xit|xdescribe|xtest|fit|fdescribe)\s*\(/,
  /eslint-disable/,
  /@ts-(ignore|expect-error|nocheck)/,
  /no-literal-string|i18n-ignore/,
];

/** New files must be source/test files, so stray tool output (e.g. .eslintcache) is never pushed. */
const NEW_FILE = /\.([cm]?[jt]sx?|snap)$/;
const EXPECT = /\b(expect|assert)\s*\(/;

/** One changed file from `git diff-tree --raw`. */
export type DiffEntry = { newMode: string; oldMode: string; path: string; status: string };

/** Everything the gate needs to know about a candidate patch. */
export type PatchSummary = {
  added: string[];
  binary: boolean;
  changedLines: number;
  entries: DiffEntry[];
  removed: string[];
};

export type PolicyContext = {
  headIsBot: boolean;
  labels: string[];
  state: string;
};

/** True when `login` is listed (approver or reviewer) in the given OWNERS file text. */
export const isTrustedAuthor = (login: string, ownersText: string): boolean => {
  const { approvers, reviewers } = parseOwnersFile(ownersText);
  return [...approvers, ...reviewers].some((name) => name.toLowerCase() === login.toLowerCase());
};

/** Parse `git diff-tree -r -z --raw --no-renames --no-abbrev` output. */
export const parseRaw = (raw: string): DiffEntry[] => {
  const parts = raw.split('\0').filter(Boolean);
  const entries: DiffEntry[] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const meta = /^:(\d+) (\d+) \w+ \w+ (\w)/.exec(parts[i] as string);
    if (meta) {
      entries.push({
        newMode: meta[2] as string,
        oldMode: meta[1] as string,
        path: parts[i + 1] as string,
        status: meta[3] as string,
      });
    }
  }
  return entries;
};

/** Sum a `git diff --numstat` output; binary files show up as "-". */
export const parseNumstat = (numstat: string): { binary: boolean; lines: number } => {
  const rows = numstat.split('\n').filter(Boolean);
  const cells = rows.map((row) => row.split('\t'));
  return {
    binary: cells.some(([add, del]) => add === '-' || del === '-'),
    lines: cells.reduce((sum, [add, del]) => sum + (Number(add) || 0) + (Number(del) || 0), 0),
  };
};

/** Added/removed content lines of a unified diff (file headers are included; they are harmless). */
export const splitUnified = (unified: string): Pick<PatchSummary, 'added' | 'removed'> => {
  const lines = unified.split('\n');
  return {
    added: lines.filter((line) => line.startsWith('+')),
    removed: lines.filter((line) => line.startsWith('-')),
  };
};

/** Build the gate input from `diff-tree --raw -z`, `diff --numstat` and `diff -U0` output. */
export const buildSummary = (raw: string, numstat: string, unified: string): PatchSummary => {
  const { binary, lines } = parseNumstat(numstat);
  return { ...splitUnified(unified), binary, changedLines: lines, entries: parseRaw(raw) };
};

/** Every reason the patch must NOT be committed. Empty = safe to apply. */
export const evaluatePolicy = (patch: PatchSummary, ctx: PolicyContext): string[] => {
  const problems: string[] = [];
  if (ctx.state !== 'open') problems.push(`PR is ${ctx.state}`);
  if (ctx.headIsBot) problems.push('head commit was authored by a bot (loop guard)');
  for (const label of ['lgtm', 'approved']) {
    if (ctx.labels.includes(label)) problems.push(`PR has the \`${label}\` label`);
  }
  if (patch.entries.length === 0) problems.push('patch is empty');
  if (patch.entries.length > LIMITS.maxFiles) {
    problems.push(`touches ${patch.entries.length} files (max ${LIMITS.maxFiles})`);
  }
  if (patch.changedLines > LIMITS.maxLines) {
    problems.push(`changes ${patch.changedLines} lines (max ${LIMITS.maxLines})`);
  }
  if (patch.binary) problems.push('contains binary changes');

  for (const { newMode, oldMode, path, status } of patch.entries) {
    const regular = newMode === '100644' && (status === 'A' || oldMode === '100644');
    if (!['A', 'M'].includes(status) || !regular) {
      problems.push(`\`${path}\`: only plain-file edits/additions are allowed (${status})`);
    }
    if (status === 'A' && !NEW_FILE.test(path))
      problems.push(`\`${path}\`: new file is not source`);
    if (isForbiddenPath(path)) {
      problems.push(`\`${path}\` is a forbidden path`);
    }
  }

  const cheats = patch.added.filter((line) => ANTI_CHEAT.some((pattern) => pattern.test(line)));
  if (cheats.length > 0) problems.push(`silences checks instead of fixing them: \`${cheats[0]}\``);
  const dropped = patch.removed.filter((line) => EXPECT.test(line)).length;
  if (dropped > patch.added.filter((line) => EXPECT.test(line)).length) {
    problems.push('removes more test assertions than it adds');
  }
  return problems;
};

/** Truncate to at most `maxBytes` of UTF-8 without splitting a character. */
export const capUtf8 = (text: string, maxBytes: number = LIMITS.promptBytes): string => {
  const buffer = Buffer.from(text, 'utf8');
  if (buffer.length <= maxBytes) return text;
  return buffer.subarray(0, maxBytes).toString('utf8').replace(/�+$/, '');
};

/** Wrap untrusted text so it cannot close the `<untrusted-data>` fence it is placed in. */
export const fenceUntrusted = (text: string): string => {
  const safe = text.replace(/<\s*(\/?)\s*untrusted-data/gi, '<$1escaped-data');
  return `<untrusted-data>\n${safe}\n</untrusted-data>`;
};
