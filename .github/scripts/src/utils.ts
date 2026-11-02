/**
 * Read a required environment variable, or throw. Throwing (not
 * process.exit) matters: every entrypoint's main().catch(...) attempts
 * best-effort status/comment reporting on failure -- process.exit would skip
 * that entirely, e.g. leaving a PR with no feedback at all if a bot-token
 * generation step failed and left GITHUB_TOKEN empty.
 */
export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * Resolve the token to use for label/comment/reaction writes that should be
 * attributed to the bot identity (e.g. `kubevirt-plugin-bot[bot]`), not the
 * default Actions identity (`github-actions[bot]` / ambient `GITHUB_TOKEN`).
 *
 * This matters beyond attribution: GitHub does not start new workflow runs
 * from a `GITHUB_TOKEN`-authored label mutation, so a `do-not-merge/*` label
 * cleared (or `*-reviewed` label added) via the ambient token never fires a
 * `labeled`/`unlabeled` event and never re-triggers `auto-merge.yml` --
 * leaving the "Merge Gate" commit status stuck on its last evaluation even
 * though the PR is actually unblocked. See ci-scripts/README.md.
 *
 * Falls back to `GITHUB_TOKEN` (and warns) only when `BOT_TOKEN` is missing
 * -- e.g. `BOT_APP_ID`/`BOT_APP_PRIVATE_KEY` misconfigured, the App
 * uninstalled, or the bot-token generation step's `continue-on-error` masked
 * a failure -- so the command still completes instead of hard-failing.
 */
export const resolveLabelWriteToken = (): string => {
  const botToken = process.env.BOT_TOKEN;
  if (botToken) {
    return botToken;
  }

  console.warn(
    'BOT_TOKEN not set -- falling back to GITHUB_TOKEN for label/comment writes. ' +
      'These writes will be attributed to github-actions[bot] and will NOT ' +
      're-trigger auto-merge.yml, so "Merge Gate" may go stale until something ' +
      'else re-evaluates it (e.g. a later lgtm/approved label change, or a ' +
      'manual re-run of the Auto Merge workflow).',
  );
  return requireEnv('GITHUB_TOKEN');
};

/** Extract a safe error message without leaking headers or response bodies. */
export const safeErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
};

/** GitHub logins are case-insensitive -- compare them the same way. */
export const sameGitHubLogin = (a: string, b: string): boolean =>
  a.toLowerCase() === b.toLowerCase();

/** Format a Jira API error, including the response body when present. */
export const jiraErrorMessage = (err: unknown): string => {
  if (!(err instanceof Error)) {
    return 'Unknown error';
  }

  const cause = err.cause;
  if (typeof cause === 'string' && cause.length > 0) {
    return `${err.message}: ${cause}`;
  }

  return err.message;
};
