export type Reason = {
  long: string;
  short: string;
};

/** Build human-readable reasons explaining why a PR is not merge-pool eligible. */
export const describeEligibility = (
  missingLgtm: boolean,
  missingApproved: boolean,
  blockingLabels: string[],
): Reason[] => {
  const reasons: Reason[] = [];

  if (missingLgtm) {
    reasons.push({
      long: 'The PR does not carry the `lgtm` label. A reviewer with write access must comment `/lgtm` or leave an approving GitHub review.',
      short: 'Missing lgtm',
    });
  }

  if (missingApproved) {
    reasons.push({
      long: 'The PR does not carry the `approved` label. An OWNERS approver must comment `/approve`.',
      short: 'Missing approved',
    });
  }

  for (const label of blockingLabels) {
    reasons.push({
      long: `The label \`${label}\` is present and blocks merging. Remove it or comment the appropriate cancel command.`,
      short: `Blocked by ${label}`,
    });
  }

  return reasons;
};
