import { appendFileSync } from 'node:fs';

/** Read a required environment variable, or throw. */
export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/** Sleep for a given number of milliseconds. */
export const sleep = (millis: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, millis));

/** Write a single-line step output to $GITHUB_OUTPUT. */
export const setOutput = (key: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) {
    throw new Error('GITHUB_OUTPUT is not set');
  }
  appendFileSync(file, `${key}=${value}\n`);
};

/** Write a multi-line step output to $GITHUB_OUTPUT using heredoc delimiters. */
export const setMultilineOutput = (key: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) {
    throw new Error('GITHUB_OUTPUT is not set');
  }
  const delim = `ghadelim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  appendFileSync(file, `${key}<<${delim}\n${value}\n${delim}\n`);
};

/** Append to $GITHUB_STEP_SUMMARY. No-op when the env var is unset. */
export const addStepSummary = (markdown: string): void => {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  appendFileSync(file, `${markdown}\n`);
};
