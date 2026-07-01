export const buildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean): string => {
  if (!passed) {
    return 'Add ai-config-reviewed label after security review';
  }
  if (!hasSensitiveChanges) {
    return 'No AI configuration changes detected';
  }
  return 'AI configuration reviewed (ai-config-reviewed)';
};
