export const buildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean): string => {
  if (!passed) {
    return 'Comment /i18n-approved after review (.github/OWNERS only)';
  }
  if (!hasSensitiveChanges) {
    return 'No translation catalog changes detected';
  }
  return 'Translations reviewed (i18n-reviewed)';
};
