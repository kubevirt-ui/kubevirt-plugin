export const buildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean): string => {
  if (!passed) {
    return 'Comment /ai-approved after security review (.github/OWNERS only)';
  }
  if (!hasSensitiveChanges) {
    return 'No AI configuration changes detected';
  }
  return 'AI configuration reviewed (ai-config-reviewed)';
};
