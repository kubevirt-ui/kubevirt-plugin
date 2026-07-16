/* eslint-disable no-console */
import { HandledValidationError } from '../pr-path-validation/errors';
import { safeErrorMessage } from '../../utils';
import type { GitHubConfig } from '../../types/index';

export type PrValidationCheck = {
  name: string;
  run: () => Promise<void>;
  /** Only called when `run` throws something other than HandledValidationError -- that already reported its own status/label before throwing. */
  reportUnexpectedError: (
    config: GitHubConfig,
    headSha: string | undefined,
    err: unknown,
  ) => Promise<void>;
};

/** Runs every check independently -- one check's failure never prevents the others from running or reporting their own status. Returns true if any check failed. */
export const runChecksIsolated = async (
  checks: PrValidationCheck[],
  config: GitHubConfig,
  headSha: string | undefined,
): Promise<boolean> => {
  // Wrap each run in an async function so a synchronous throw inside `run`
  // becomes a rejected promise (isolated by allSettled) instead of aborting
  // the map and skipping later checks entirely.
  const results = await Promise.allSettled(checks.map(async (check) => check.run()));

  let anyFailed = false;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled') continue;

    anyFailed = true;
    const { name, reportUnexpectedError } = checks[i];
    console.error(`${name} failed: ${safeErrorMessage(result.reason)}`);

    if (!(result.reason instanceof HandledValidationError)) {
      // A reporter throwing must not stop later checks in this loop from
      // being processed/reported too.
      try {
        await reportUnexpectedError(config, headSha, result.reason);
      } catch (reportErr) {
        console.error(
          `${name} failed to report its own unexpected error: ${safeErrorMessage(reportErr)}`,
        );
      }
    }
  }
  return anyFailed;
};
