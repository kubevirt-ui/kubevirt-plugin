import type { TemplateConfig } from '@/data-factories/template-factory';

const TEMPLATE_TIMEOUT_MS = 30000;
const TEMPLATE_LARGE_TIMEOUT_MS = 45000;

/**
 * Base type for Template test case parameters
 */
export type TemplateTestCaseParams = {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  templateConfig: Partial<TemplateConfig>;
  testCaseName: string;
};

/**
 * Template creation test fixtures - different template configurations to test
 */
export const TEMPLATE_CREATION_FIXTURES: TemplateTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 1,
      memory: '2Gi',
      osLabel: 'fedora',
      osName: 'Fedora',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'basic Fedora server template',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 2,
      flavor: 'medium',
      memory: '4Gi',
      runStrategy: 'Always',
      size: 'medium',
    },
    testCaseName: 'template with standard resources',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_LARGE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      flavor: 'large',
      memory: '8Gi',
      runStrategy: 'Always',
      size: 'large',
    },
    testCaseName: 'template with high resources',
  },
];

/**
 * OS-specific template test fixtures
 */
export const TEMPLATE_OS_FIXTURES: TemplateTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cloudInitUser: 'fedora',
      cpuCores: 2,
      iconClass: 'icon-fedora',
      memory: '4Gi',
      osLabel: 'fedora',
      osName: 'Fedora',
      rootDiskImage: 'quay.io/containerdisks/fedora',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'Fedora server template',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cloudInitUser: 'ubuntu',
      cpuCores: 2,
      iconClass: 'icon-ubuntu',
      memory: '2Gi',
      os: 'ubuntu',
      osLabel: 'ubuntu',
      osName: 'Ubuntu',
      rootDiskImage: 'quay.io/containerdisks/ubuntu:22.04',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'Ubuntu server template',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cloudInitUser: 'cloud-user',
      cpuCores: 2,
      iconClass: 'icon-redhat',
      memory: '4Gi',
      os: 'rhel9',
      osLabel: 'rhel9',
      osName: 'RHEL 9',
      rootDiskImage: 'quay.io/containerdisks/rhel9',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'RHEL server template',
  },
];

/**
 * Workload-specific template test fixtures
 */
export const TEMPLATE_WORKLOAD_FIXTURES: TemplateTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 2,
      flavor: 'medium',
      memory: '4Gi',
      workload: 'desktop',
      workloadLabel: 'desktop',
    },
    testCaseName: 'desktop workload template',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 2,
      flavor: 'medium',
      memory: '4Gi',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'server workload template',
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_LARGE_TIMEOUT_MS,
    },
    templateConfig: {
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      flavor: 'large',
      memory: '16Gi',
      workload: 'highperformance',
      workloadLabel: 'highperformance',
    },
    testCaseName: 'high-performance workload template',
  },
];

/**
 * Combined test suite fixture - for smoke/comprehensive testing
 */
export const TEMPLATE_SMOKE_TEST_FIXTURE: TemplateTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: TEMPLATE_TIMEOUT_MS,
  },
  templateConfig: {
    cpuCores: 2,
    memory: '4Gi',
    runStrategy: 'Halted',
    workload: 'server',
    workloadLabel: 'server',
  },
  testCaseName: 'standard template for smoke testing',
};
