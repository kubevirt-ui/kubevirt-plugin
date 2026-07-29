import type { GitHubConfig } from '../../types/index';
import { safeErrorMessage } from '../../utils';
import { HandledValidationError } from '../pr-path-validation/errors';

export type PrValidationCheck = {
  name: string;
  /** Only called when `run` throws something other than HandledValidationError -- that already reported its own status/label before throwing. */
  reportUnexpectedError: (
    config: GitHubConfig,
    headSha: string | undefined,
    err: unknown,
  ) => Promise<void>;
  run: () => Promise<void>;
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

  const failures = results
    .map((result, i) => ({ check: checks[i], result }))
    .filter(({ result }) => result.status === 'rejected') as Array<{
    check: PrValidationCheck;
    result: PromiseRejectedResult;
  }>;

  for (const { check, result } of failures) {
    console.error(`${check.name} failed: ${safeErrorMessage(result.reason)}`);

    if (!(result.reason instanceof HandledValidationError)) {
      try {
        await check.reportUnexpectedError(config, headSha, result.reason);
      } catch (reportErr) {
        console.error(
          `${check.name} failed to report its own unexpected error: ${safeErrorMessage(reportErr)}`,
        );
      }
    }
  }
  return failures.length > 0;
};
