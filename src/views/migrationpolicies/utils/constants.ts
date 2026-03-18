export const migrationPolicySpecKeys = {
  ALLOW_AUTO_CONVERGE: 'allowAutoConverge',
  ALLOW_POST_COPY: 'allowPostCopy',
  BANDWIDTH_PER_MIGRATION: 'bandwidthPerMigration',
  COMPLETION_TIMEOUT_PER_GIB: 'completionTimeoutPerGiB',
};

export const MIGRATION_POLICY_COLUMN_KEYS = {
  AUTO_CONVERGE: 'auto-converge',
  BANDWIDTH: 'bandwidth',
  CLUSTER: 'cluster',
  COMPLETION_TIMEOUT: 'completion-timeout',
  NAME: 'name',
  POST_COPY: 'post-copy',
  PROJECT_LABELS: 'project-labels',
  VM_LABELS: 'vm-labels',
} as const;

export const COLUMN_MANAGEMENT_ID_MIGRATION_POLICIES = 'migration-policies-list';
