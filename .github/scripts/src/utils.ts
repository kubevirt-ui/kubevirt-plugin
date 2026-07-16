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

/** Extract a safe error message without leaking headers or response bodies. */
export const safeErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
};

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
