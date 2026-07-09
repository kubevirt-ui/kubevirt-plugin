import type { VirtualMachineConfig } from '@/data-factories/virtual-machine-factory';

/**
 * Base interface for VM test case parameters
 */
export interface VmTestCaseParams {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  testCaseName: string;
  vmConfig: Partial<VirtualMachineConfig>;
}

/**
 * VM creation test fixtures - different VM configurations to test
 */
export const VM_CREATION_FIXTURES: VmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'basic VM with minimal resources',
    vmConfig: {
      cpuCores: 1,
      memory: '2Gi',
      runStrategy: 'Always',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with standard resources',
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Always',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 45000,
    },
    testCaseName: 'VM with high resources',
    vmConfig: {
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      flavor: 'large',
      memory: '8Gi',
      runStrategy: 'Always',
      size: 'large',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with Manual run strategy',
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Manual',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with RerunOnFailure strategy',
    vmConfig: {
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'RerunOnFailure',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with BIOS boot mode',
    vmConfig: {
      bootMode: 'bios',
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Always',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with UEFI boot mode',
    vmConfig: {
      bootMode: 'uefi',
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Always',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with UEFI Secure Boot mode',
    vmConfig: {
      bootMode: 'uefi-secure',
      cpuCores: 2,
      memory: '4Gi',
      runStrategy: 'Always',
    },
  },
];

/**
 * OS-specific VM test fixtures
 */
export const VM_OS_FIXTURES: VmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'Fedora server VM',
    vmConfig: {
      cloudInitUser: 'fedora',
      cpuCores: 2,
      memory: '4Gi',
      os: 'fedora',
      osLabel: 'fedora',
      rootDiskImage: 'quay.io/containerdisks/fedora',
      workload: 'server',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'Ubuntu server VM',
    vmConfig: {
      cloudInitUser: 'ubuntu',
      cpuCores: 2,
      memory: '2Gi',
      os: 'ubuntu',
      osLabel: 'ubuntu',
      rootDiskImage: 'quay.io/containerdisks/ubuntu:22.04',
      workload: 'server',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'RHEL server VM',
    vmConfig: {
      cloudInitUser: 'cloud-user',
      cpuCores: 2,
      memory: '4Gi',
      os: 'rhel9',
      osLabel: 'rhel9',
      rootDiskImage: 'quay.io/containerdisks/rhel9',
      workload: 'server',
    },
  },
];

/**
 * Workload-specific VM test fixtures
 */
export const VM_WORKLOAD_FIXTURES: VmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'desktop workload VM',
    vmConfig: {
      cpuCores: 2,
      flavor: 'medium',
      memory: '4Gi',
      workload: 'desktop',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'server workload VM',
    vmConfig: {
      cpuCores: 2,
      flavor: 'medium',
      memory: '4Gi',
      workload: 'server',
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 45000,
    },
    testCaseName: 'high-performance workload VM',
    vmConfig: {
      cpuCores: 4,
      cpuSockets: 2,
      cpuThreads: 2,
      flavor: 'large',
      memory: '16Gi',
      workload: 'highperformance',
    },
  },
];

/**
 * Network configuration VM test fixtures
 */
export const VM_NETWORK_FIXTURES: VmTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with virtio network interface',
    vmConfig: {
      cpuCores: 2,
      interfaceModel: 'virtio',
      memory: '4Gi',
      networkInterfaceMultiqueue: true,
    },
  },
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    testCaseName: 'VM with e1000 network interface',
    vmConfig: {
      cpuCores: 2,
      interfaceModel: 'e1000',
      memory: '4Gi',
      networkInterfaceMultiqueue: false,
    },
  },
];

/**
 * Combined test suite fixture - for smoke/comprehensive testing
 */
export const VM_SMOKE_TEST_FIXTURE: VmTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: 30000,
  },
  testCaseName: 'standard VM for smoke testing',
  vmConfig: {
    cpuCores: 2,
    memory: '4Gi',
    runStrategy: 'Always',
    workload: 'server',
  },
};
