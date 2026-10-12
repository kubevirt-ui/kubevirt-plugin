import type { VirtualMachineConfig } from '@/data-factories/virtual-machine-factory';

const TEMPLATE_VM_TIMEOUT_MS = 30000;

/**
 * Template selector configuration for VM creation
 */
export type TemplateSelectorConfig = {
  /** The data-test value for template selection (e.g., "rhel7-server-small") */
  templateTestId: string;
  /** Human-readable template name for test descriptions */
  templateName: string;
  /** Operating system variant */
  os: 'rhel7' | 'rhel8' | 'rhel9' | 'fedora' | 'centos-stream9';
  /** Workload type */
  workload: 'server' | 'desktop';
  /** Template size variant */
  size: 'small' | 'medium' | 'large';
};

/**
 * Base type for template-based VM test case parameters
 */
export type TemplateVmTestCaseParams = {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  testCaseName: string;
  templateConfig: TemplateSelectorConfig;
  vmConfig?: Partial<VirtualMachineConfig>;
  startAfterCreation?: boolean;
};

/**
 * Template-based VM creation test fixtures - different template configurations to test
 */
export const TEMPLATE_VM_CREATION_FIXTURES: TemplateVmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'CentOS Stream 9 VM from template',
    templateConfig: {
      templateTestId: 'centos-stream9-server-small',
      templateName: 'CentOS Stream 9 VM',
      os: 'centos-stream9',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 1,
      memory: '2Gi',
      runStrategy: 'Always',
    },
    startAfterCreation: true,
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'Fedora VM from template (not started)',
    templateConfig: {
      templateTestId: 'fedora-server-small',
      templateName: 'Fedora VM',
      os: 'fedora',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 1,
      memory: '2Gi',
      runStrategy: 'Manual',
    },
    startAfterCreation: false,
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'Red Hat Enterprise Linux 8 VM from template',
    templateConfig: {
      templateTestId: 'rhel8-server-small',
      templateName: 'Red Hat Enterprise Linux 8 VM',
      os: 'rhel8',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 1,
      memory: '2Gi',
      runStrategy: 'Always',
    },
    startAfterCreation: true,
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'Red Hat Enterprise Linux 9 VM from template (not started)',
    templateConfig: {
      templateTestId: 'rhel9-server-small',
      templateName: 'Red Hat Enterprise Linux 9 VM',
      os: 'rhel9',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 1,
      memory: '2Gi',
      runStrategy: 'Manual',
    },
    startAfterCreation: false,
  },
];

/**
 * OS-specific template VM test fixtures
 */
export const TEMPLATE_VM_OS_FIXTURES: TemplateVmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'RHEL8 template VM with custom resources',
    templateConfig: {
      templateTestId: 'rhel8-server-small',
      templateName: 'Red Hat Enterprise Linux 8 VM',
      os: 'rhel8',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Manual',
    },
    startAfterCreation: false,
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'RHEL9 template VM with high resources',
    templateConfig: {
      templateTestId: 'rhel9-server-small',
      templateName: 'Red Hat Enterprise Linux 9 VM',
      os: 'rhel9',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 4,
      memory: '8Gi',
      runStrategy: 'Always',
    },
    startAfterCreation: true,
  },
];

/**
 * Workload-specific template VM test fixtures
 */
export const TEMPLATE_VM_WORKLOAD_FIXTURES: TemplateVmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'Server workload template VM',
    templateConfig: {
      templateTestId: 'rhel8-server-small',
      templateName: 'Red Hat Enterprise Linux 8 VM',
      os: 'rhel8',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Always',
    },
    startAfterCreation: true,
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: TEMPLATE_VM_TIMEOUT_MS,
    },
    testCaseName: 'CentOS Stream9 workload template VM (not started)',
    templateConfig: {
      templateTestId: 'centos-stream9-server-small',
      templateName: 'CentOS Stream 9 VM',
      os: 'centos-stream9',
      workload: 'server',
      size: 'small',
    },
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Manual',
    },
    startAfterCreation: false,
  },
];

/**
 * Combined test suite fixture - for smoke/comprehensive testing
 */
export const TEMPLATE_VM_SMOKE_TEST_FIXTURE: TemplateVmTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: TEMPLATE_VM_TIMEOUT_MS,
  },
  testCaseName: 'standard template VM for smoke testing',
  templateConfig: {
    templateTestId: 'rhel8-server-small',
    templateName: 'Red Hat Enterprise Linux 8 VM',
    os: 'rhel8',
    workload: 'server',
    size: 'small',
  },
  vmConfig: {
    cpuCores: 2,
    memory: '4Gi',
    runStrategy: 'Always',
  },
  startAfterCreation: true,
};
