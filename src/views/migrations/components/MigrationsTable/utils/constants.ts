export const MIGRATION_COLUMN_KEYS = {
  CREATED: 'created',
  MIGRATION_POLICY: 'migration-policy',
  NAMESPACE: 'namespace',
  PROGRESS: 'progress-indicator',
  SOURCE: 'source',
  STATUS: 'status',
  TARGET: 'target',
  VM_NAME: 'vm-name',
  VMIM_NAME: 'vmim-name',
} as const;

export const COLUMN_MANAGEMENT_ID_MIGRATIONS = 'migrations-table';

export const MIGRATION_STATUS_FILTER_ID = 'status';
export const MIGRATION_SOURCE_FILTER_ID = 'source';
export const MIGRATION_TARGET_FILTER_ID = 'target';
