/**
 * Instance Type Test Fixtures
 *
 * Test data for parameterized instance type creation tests.
 * These fixtures define various instance type configurations for both
 * user-defined (namespaced) and cluster-scoped instance types.
 *
 * Validation Approach:
 * - Instance types are validated by checking if they appear in LIST operations
 * - This is more reliable than GET operations due to eventual consistency
 * - The full resource object is retrieved from the list for property verification
 * - Timeout values specify how long to poll the list until the resource appears
 */

import type { VirtualMachineInstanceTypeConfig } from '@/data-factories/instance-type-factory';

const INSTANCE_TYPE_LIST_TIMEOUT_MS = 15000;

/**
 * Base type for InstanceType test case parameters
 */
export type InstanceTypeTestCaseParams = {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  instanceTypeConfig: Partial<VirtualMachineInstanceTypeConfig>;
  testCaseName: string;
};

/**
 * User-defined (namespaced) InstanceType creation test fixtures
 *
 * These are project-specific instance types that can be created by regular users.
 * Validation checks if the instance type appears in the namespace's instance type list.
 */
export const USER_INSTANCE_TYPE_CREATION_FIXTURES: InstanceTypeTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 1,
      isClusterScoped: false,
      memoryGuest: '2Gi',
    },
    testCaseName: 'small user instance type (1 CPU, 2Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      isClusterScoped: false,
      memoryGuest: '4Gi',
    },
    testCaseName: 'medium user instance type (2 CPUs, 4Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 4,
      isClusterScoped: false,
      memoryGuest: '8Gi',
    },
    testCaseName: 'large user instance type (4 CPUs, 8Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 8,
      isClusterScoped: false,
      memoryGuest: '16Gi',
    },
    testCaseName: 'extra large user instance type (8 CPUs, 16Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 6,
      isClusterScoped: false,
      memoryGuest: '12Gi',
    },
    testCaseName: 'custom user instance type (6 CPUs, 12Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      customLabels: {
        app: 'test-app',
        environment: 'testing',
        tier: 'frontend',
      },
      isClusterScoped: false,
      memoryGuest: '4Gi',
    },
    testCaseName: 'user instance type with custom labels',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      customAnnotations: {
        description: 'Test instance type with annotations',
        owner: 'test-team',
        purpose: 'automated-testing',
      },
      isClusterScoped: false,
      memoryGuest: '4Gi',
    },
    testCaseName: 'user instance type with custom annotations',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 4,
      customAnnotations: {
        description: 'Production-ready instance type',
        maintainer: 'platform-team',
      },
      customLabels: {
        app: 'production-app',
        version: 'v1.0',
      },
      isClusterScoped: false,
      memoryGuest: '8Gi',
    },
    testCaseName: 'user instance type with both labels and annotations',
  },
];

/**
 * Cluster-scoped InstanceType creation test fixtures
 *
 * These require cluster-admin privileges to create.
 * Validation checks if the instance type appears in the cluster-wide instance type list.
 */
export const CLUSTER_INSTANCE_TYPE_CREATION_FIXTURES: InstanceTypeTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 1,
      isClusterScoped: true,
      memoryGuest: '2Gi',
    },
    testCaseName: 'small cluster instance type (1 CPU, 2Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      isClusterScoped: true,
      memoryGuest: '4Gi',
    },
    testCaseName: 'medium cluster instance type (2 CPUs, 4Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 4,
      isClusterScoped: true,
      memoryGuest: '8Gi',
    },
    testCaseName: 'large cluster instance type (4 CPUs, 8Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      customLabels: {
        'managed-by': 'platform-team',
        scope: 'cluster-wide',
      },
      isClusterScoped: true,
      memoryGuest: '4Gi',
    },
    testCaseName: 'cluster instance type with custom labels',
  },
];

/**
 * Smoke test fixture for quick verification
 *
 * Single fixture for rapid validation that the instance type creation flow works.
 * Uses list-based validation for reliability.
 */
export const INSTANCE_TYPE_SMOKE_TEST_FIXTURE: InstanceTypeTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
  },
  instanceTypeConfig: {
    cpuGuest: 2,
    isClusterScoped: false,
    memoryGuest: '4Gi',
  },
  testCaseName: 'smoke test: standard user instance type',
};

/**
 * Edge case fixtures for testing boundary conditions
 *
 * Tests minimal/maximum resource configurations and different memory units.
 * All validated via list operations to ensure consistency.
 */
export const INSTANCE_TYPE_EDGE_CASE_FIXTURES: InstanceTypeTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 1,
      isClusterScoped: false,
      memoryGuest: '1Gi',
    },
    testCaseName: 'minimal resources (1 CPU, 1Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 16,
      isClusterScoped: false,
      memoryGuest: '32Gi',
    },
    testCaseName: 'high resources (16 CPUs, 32Gi memory)',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: INSTANCE_TYPE_LIST_TIMEOUT_MS,
    },
    instanceTypeConfig: {
      cpuGuest: 2,
      isClusterScoped: false,
      memoryGuest: '4096Mi',
    },
    testCaseName: 'memory in Mi units (2 CPUs, 4096Mi memory)',
  },
];

/**
 * Combined exports for convenience
 *
 * ALL_USER_INSTANCE_TYPE_FIXTURES combines both standard and edge case fixtures
 * for comprehensive test coverage with consistent list-based validation.
 */
export const ALL_USER_INSTANCE_TYPE_FIXTURES = [
  ...USER_INSTANCE_TYPE_CREATION_FIXTURES,
  ...INSTANCE_TYPE_EDGE_CASE_FIXTURES,
];
