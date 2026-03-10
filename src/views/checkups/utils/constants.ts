export const CHECKUP_URLS = {
  SELF_VALIDATION: 'self-validation',
  STORAGE: 'storage',
} as const;

export const CHECKUP_STATUS_COLORS = {
  COMPLETED: 'var(--pf-t--global--icon--color--status--success--default)',
  FAILED: 'var(--pf-t--global--icon--color--status--danger--default)',
  IN_PROGRESS: 'var(--pf-t--global--icon--color--status--info--default)',
  SKIPPED: 'var(--pf-t--global--icon--color--subtle)',
  SUCCESS: 'var(--pf-t--global--icon--color--status--success--default)',
} as const;

export const CHECKUPS_COLUMN_KEYS = {
  COMPLETE_TIME: 'complete-time',
  START_TIME: 'start-time',
  START_TIME_CAMEL: 'startTime',
} as const;
