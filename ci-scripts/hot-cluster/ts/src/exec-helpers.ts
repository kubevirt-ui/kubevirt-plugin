import { execSync } from 'node:child_process';

/** Run a command and return trimmed stdout, or throw. */
export const exec = (cmd: string, opts?: { cwd?: string; timeout?: number }): string =>
  execSync(cmd, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: opts?.timeout ?? 30000,
    ...(opts?.cwd ? { cwd: opts.cwd } : {}),
  }).trim();

/** Run a command and return trimmed stdout, or empty string on failure. */
export const execSafe = (cmd: string, opts?: { cwd?: string; timeout?: number }): string => {
  try {
    return exec(cmd, opts);
  } catch {
    return '';
  }
};

/** Run a command and return its exit code. */
export const execStatus = (cmd: string): number => {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return 0;
  } catch (err) {
    return (err as { status?: number }).status ?? 1;
  }
};
