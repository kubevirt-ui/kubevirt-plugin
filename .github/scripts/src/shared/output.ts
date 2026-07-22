import { appendFileSync } from 'node:fs';

/**
 * Write a step output to $GITHUB_OUTPUT. Handles multiline values
 * automatically using the heredoc delimiter syntax that GitHub Actions
 * requires (single-line `key=value` breaks on newlines).
 */
export const setOutput = (key: string, value: string): void => {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) throw new Error('GITHUB_OUTPUT is not set');

  if (value.includes('\n')) {
    const delim = `ghadelim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    appendFileSync(file, `${key}<<${delim}\n${value}\n${delim}\n`);
  } else {
    appendFileSync(file, `${key}=${value}\n`);
  }
};

/**
 * Append to $GITHUB_STEP_SUMMARY (the job summary markdown panel).
 * No-op when the env var is unset (e.g. in tests or local runs).
 */
export const addStepSummary = (markdown: string): void => {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  appendFileSync(file, `${markdown}\n`);
};

/**
 * Emit a GitHub Actions error annotation and exit with code 1.
 * Use this as the `npx tsx` equivalent of `core.setFailed()`.
 */
export const failStep = (message: string): never => {
  console.error(`::error::${message}`);
  process.exit(1);
};

/**
 * Emit a GitHub Actions warning annotation (does not fail the step).
 */
export const warnStep = (message: string): void => {
  console.error(`::warning::${message}`);
};
