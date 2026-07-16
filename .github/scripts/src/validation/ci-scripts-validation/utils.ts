export const buildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean): string => {
  if (!passed) {
    return 'Comment /ci-approved after security review (.github/OWNERS only)';
  }
  if (!hasSensitiveChanges) {
    return 'No CI configuration changes detected';
  }
  return 'CI configuration reviewed (ci-scripts-reviewed)';
};
