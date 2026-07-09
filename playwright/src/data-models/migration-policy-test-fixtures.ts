/**
 * MigrationPolicy Test Fixtures
 *
 * Test data for parameterized migration policy creation tests.
 * These fixtures define various migration policy configurations
 * for YAML-based creation tests.
 *
 * Validation Approach:
 * - Migration policies are validated by checking if they exist in the cluster
 * - Cluster-scoped resources are verified via GET operations
 * - Timeout values specify how long to poll until the resource appears
 */

import type { MigrationPolicyConfig } from '@/data-factories/migration-policy-factory';

const MIGRATION_POLICY_TIMEOUT_MS = 30000;

/**
 * Base type for MigrationPolicy test case parameters
 */
export type MigrationPolicyTestCaseParams = {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  migrationPolicyConfig: Partial<MigrationPolicyConfig>;
  testCaseName: string;
};

/**
 * MigrationPolicy creation test fixtures
 *
 * These are cluster-scoped migration policies.
 * Validation checks if the migration policy exists in the cluster.
 */
export const MIGRATION_POLICY_CREATION_FIXTURES: MigrationPolicyTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Minimal migration policy for testing',
    },
    testCaseName: 'minimal migration policy with empty selectors',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      description: 'Migration policy with auto-converge',
    },
    testCaseName: 'migration policy with auto-converge enabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowPostCopy: true,
      description: 'Migration policy with post-copy',
    },
    testCaseName: 'migration policy with post-copy enabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '64Mi',
      description: 'Migration policy with bandwidth limit',
    },
    testCaseName: 'migration policy with bandwidth limit',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      completionTimeoutPerGiB: 800,
      description: 'Migration policy with completion timeout',
    },
    testCaseName: 'migration policy with completion timeout',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      allowPostCopy: false,
      bandwidthPerMigration: '128Mi',
      completionTimeoutPerGiB: 1200,
      description: 'Comprehensive migration policy',
    },
    testCaseName: 'migration policy with all configuration options',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Migration policy targeting specific VMs',
      virtualMachineInstanceSelector: {
        tier: 'frontend',
        workload: 'production',
      },
    },
    testCaseName: 'migration policy with VM selector',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Migration policy targeting specific namespaces',
      namespaceSelector: {
        environment: 'staging',
        team: 'backend',
      },
    },
    testCaseName: 'migration policy with namespace selector',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Migration policy with both selectors',
      namespaceSelector: {
        environment: 'production',
      },
      virtualMachineInstanceSelector: {
        priority: 'high',
      },
    },
    testCaseName: 'migration policy with both VM and namespace selectors',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      customLabels: {
        'managed-by': 'platform-team',
        'policy-type': 'high-priority',
      },
      description: 'Migration policy with custom labels',
    },
    testCaseName: 'migration policy with custom labels',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '64Mi',
      customAnnotations: {
        owner: 'virtualization-team',
        purpose: 'automated-testing',
      },
      description: 'Migration policy with custom annotations',
    },
    testCaseName: 'migration policy with custom annotations',
  },
];

/**
 * Smoke test fixture for quick verification
 *
 * Single fixture for rapid validation that the migration policy creation flow works.
 */
export const MIGRATION_POLICY_SMOKE_TEST_FIXTURE: MigrationPolicyTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: MIGRATION_POLICY_TIMEOUT_MS,
  },
  migrationPolicyConfig: {
    allowAutoConverge: true,
    bandwidthPerMigration: '64Mi',
    description: 'Standard migration policy for smoke testing',
  },
  testCaseName: 'smoke test: standard migration policy',
};

/**
 * Edge case fixtures for testing boundary conditions
 *
 * Tests various configuration combinations and edge cases.
 */
export const MIGRATION_POLICY_EDGE_CASE_FIXTURES: MigrationPolicyTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '0',
      description: 'Migration policy with unlimited bandwidth',
    },
    testCaseName: 'migration policy with unlimited bandwidth (0)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '1Gi',
      description: 'Migration policy with high bandwidth',
    },
    testCaseName: 'migration policy with high bandwidth limit',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      completionTimeoutPerGiB: 1,
      description: 'Migration policy with minimal timeout',
    },
    testCaseName: 'migration policy with minimal timeout',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      allowPostCopy: true,
      description: 'Migration policy with both migration strategies',
    },
    testCaseName: 'migration policy with both auto-converge and post-copy',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Migration policy with multiple selector labels',
      namespaceSelector: {
        compliance: 'pci',
        environment: 'production',
        region: 'us-east',
      },
      virtualMachineInstanceSelector: {
        app: 'database',
        priority: 'critical',
        tier: 'backend',
        version: 'v2',
      },
    },
    testCaseName: 'migration policy with complex selectors',
  },
];

/**
 * Combined exports for convenience
 *
 * ALL_MIGRATION_POLICY_FIXTURES combines both standard and edge case fixtures
 * for comprehensive test coverage.
 */
export const ALL_MIGRATION_POLICY_FIXTURES = [
  ...MIGRATION_POLICY_CREATION_FIXTURES,
  ...MIGRATION_POLICY_EDGE_CASE_FIXTURES,
];

/**
 * Form-based creation test fixtures
 *
 * These fixtures are specifically for testing migration policy creation via the form UI.
 * Only includes fields that are supported by the form (excludes selectors, labels, annotations).
 */
export const MIGRATION_POLICY_FORM_FIXTURES: MigrationPolicyTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      description: 'Minimal migration policy created via form',
    },
    testCaseName: 'minimal migration policy with description only',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      description: 'Policy with auto-converge enabled',
    },
    testCaseName: 'migration policy with auto-converge enabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: false,
      description: 'Policy with auto-converge disabled',
    },
    testCaseName: 'migration policy with auto-converge disabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowPostCopy: true,
      description: 'Policy with post-copy enabled',
    },
    testCaseName: 'migration policy with post-copy enabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowPostCopy: false,
      description: 'Policy with post-copy disabled',
    },
    testCaseName: 'migration policy with post-copy disabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '128Mi',
      description: 'Policy with bandwidth limit',
    },
    testCaseName: 'migration policy with bandwidth limit',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      completionTimeoutPerGiB: 900,
      description: 'Policy with completion timeout',
    },
    testCaseName: 'migration policy with completion timeout',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      allowPostCopy: false,
      bandwidthPerMigration: '256Mi',
      completionTimeoutPerGiB: 1500,
      description: 'Comprehensive form-based migration policy',
    },
    testCaseName: 'migration policy with all form configurations',
  },
];

/**
 * Form smoke test fixture for quick verification
 */
export const MIGRATION_POLICY_FORM_SMOKE_TEST_FIXTURE: MigrationPolicyTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: MIGRATION_POLICY_TIMEOUT_MS,
  },
  migrationPolicyConfig: {
    allowAutoConverge: true,
    bandwidthPerMigration: '100Mi',
    description: 'Standard policy for form smoke testing',
  },
  testCaseName: 'smoke test: standard form-based migration policy',
};

/**
 * Form edge case fixtures
 */
export const MIGRATION_POLICY_FORM_EDGE_CASE_FIXTURES: MigrationPolicyTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: true,
      allowPostCopy: true,
      description: 'Policy with both migration strategies',
    },
    testCaseName: 'migration policy with both auto-converge and post-copy enabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      allowAutoConverge: false,
      allowPostCopy: false,
      description: 'Policy with both strategies disabled',
    },
    testCaseName: 'migration policy with both strategies disabled',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      bandwidthPerMigration: '1Gi',
      description: 'Policy with high bandwidth',
    },
    testCaseName: 'migration policy with high bandwidth limit',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      completionTimeoutPerGiB: 1,
      description: 'Policy with minimal timeout',
    },
    testCaseName: 'migration policy with minimal completion timeout',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: MIGRATION_POLICY_TIMEOUT_MS,
    },
    migrationPolicyConfig: {
      completionTimeoutPerGiB: 10000,
      description: 'Policy with large timeout',
    },
    testCaseName: 'migration policy with large completion timeout',
  },
];
