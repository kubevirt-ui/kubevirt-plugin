import { safeErrorMessage } from '../../utils';
import { HandledValidationError } from '../pr-path-validation/errors';

export type PrValidationCheck = {
  name: string;
  run: () => Promise<void>;
};

/** Runs every check independently -- one check's failure never prevents the others from running. Returns true if any check failed. */
export const runChecksIsolated = async (checks: PrValidationCheck[]): Promise<boolean> => {
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
    // HandledValidationError already synced labels / jira status before throwing.
    const prefix =
      result.reason instanceof HandledValidationError
        ? `${check.name} failed`
        : `${check.name} unexpected error`;
    console.error(`${prefix}: ${safeErrorMessage(result.reason)}`);
  }
  return failures.length > 0;
};
