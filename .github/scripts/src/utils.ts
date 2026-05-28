/** Read a required environment variable or exit with an error. */
export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
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
