import { InstanceTypeSeries, InstanceTypeSize, OperatingSystem } from '@/data-factories';

const CREATE_VM_TIMEOUT_MS = 60000;
const CREATE_VM_LARGE_TIMEOUT_MS = 90000;

/**
 * Catalog VM creation test case parameters
 */
export type CreateVmTestScenario = {
  description: string;
  os: OperatingSystem;
  series: InstanceTypeSeries;
  size: InstanceTypeSize;
  namePrefix: string;
  startAfterCreation: boolean;
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
};

/**
 * Catalog VM creation test fixtures - different VM configurations using Instance Types
 *
 * Each scenario tests a different combination of:
 * - Operating System (RHEL, CentOS, Fedora)
 * - Instance Type Series (N, O, M, RT, CX, U)
 * - Instance Size - Using LOWEST available resources for each series
 * - Start behavior (auto-start enabled/disabled)
 */
export const CREATE_VM_CREATION_SCENARIOS: CreateVmTestScenario[] = [
  {
    description: 'RHEL 9 with CX series medium (lowest available)',
    os: OperatingSystem.RHEL_9_AMD64,
    series: InstanceTypeSeries.CX,
    size: InstanceTypeSize.MEDIUM,
    namePrefix: 'rhel9-cx',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'CentOS Stream 10 with N series medium (lowest available)',
    os: OperatingSystem.CENTOS_STREAM_10,
    series: InstanceTypeSeries.N,
    size: InstanceTypeSize.MEDIUM,
    namePrefix: 'centos10-n',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'Fedora with U series small (2 GiB)',
    os: OperatingSystem.FEDORA_AMD64,
    series: InstanceTypeSeries.U,
    size: InstanceTypeSize.SMALL,
    namePrefix: 'fedora-u',
    startAfterCreation: true,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'CentOS Stream 9 with O series small (2 GiB)',
    os: OperatingSystem.CENTOS_STREAM_9,
    series: InstanceTypeSeries.O,
    size: InstanceTypeSize.SMALL,
    namePrefix: 'centos9-o',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'RHEL 10 with M series large (lowest available)',
    os: OperatingSystem.RHEL_10_AMD64,
    series: InstanceTypeSeries.M,
    size: InstanceTypeSize.LARGE,
    namePrefix: 'rhel10-m',
    startAfterCreation: true,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'RHEL 8 with RT series small (2 GiB)',
    os: OperatingSystem.RHEL_8,
    series: InstanceTypeSeries.RT,
    size: InstanceTypeSize.SMALL,
    namePrefix: 'rhel8-rt',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
];

/**
 * Minimal test scenarios for smoke testing
 * Quick subset of scenarios for faster test execution using lowest resources
 */
export const CREATE_VM_SMOKE_SCENARIOS: CreateVmTestScenario[] = [
  {
    description: 'Quick smoke test - CentOS with U series nano (lowest)',
    os: OperatingSystem.CENTOS_STREAM_10,
    series: InstanceTypeSeries.U,
    size: InstanceTypeSize.NANO,
    namePrefix: 'smoke-centos-u',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'Quick smoke test - RHEL with N series medium (lowest)',
    os: OperatingSystem.RHEL_9_AMD64,
    series: InstanceTypeSeries.N,
    size: InstanceTypeSize.MEDIUM,
    namePrefix: 'smoke-rhel-n',
    startAfterCreation: true,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
];

/**
 * Extended test scenarios for comprehensive testing
 * Covers edge cases and less common configurations
 */
export const CREATE_VM_EXTENDED_SCENARIOS: CreateVmTestScenario[] = [
  {
    description: 'Fedora with O series nano (minimal resources)',
    os: OperatingSystem.FEDORA_AMD64,
    series: InstanceTypeSeries.O,
    size: InstanceTypeSize.NANO,
    namePrefix: 'fedora-o-nano',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_TIMEOUT_MS,
    },
  },
  {
    description: 'RHEL 10 with CX series 8xlarge (maximum resources)',
    os: OperatingSystem.RHEL_10_AMD64,
    series: InstanceTypeSeries.CX,
    size: InstanceTypeSize.XLARGE_8,
    namePrefix: 'rhel10-cx-8xl',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_LARGE_TIMEOUT_MS,
    },
  },
  {
    description: 'CentOS Stream 9 with M series 4xlarge',
    os: OperatingSystem.CENTOS_STREAM_9,
    series: InstanceTypeSeries.M,
    size: InstanceTypeSize.XLARGE_4,
    namePrefix: 'centos9-m-4xl',
    startAfterCreation: true,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_LARGE_TIMEOUT_MS,
    },
  },
  {
    description: 'RHEL 8 with RT series 2xlarge',
    os: OperatingSystem.RHEL_8,
    series: InstanceTypeSeries.RT,
    size: InstanceTypeSize.XLARGE_2,
    namePrefix: 'rhel8-rt-2xl',
    startAfterCreation: false,
    expectedBehavior: {
      shouldCreate: true,
      timeout: CREATE_VM_LARGE_TIMEOUT_MS,
    },
  },
];

/**
 * All catalog test scenarios combined
 */
export const ALL_CREATE_VM_SCENARIOS: CreateVmTestScenario[] = [
  ...CREATE_VM_CREATION_SCENARIOS,
  ...CREATE_VM_EXTENDED_SCENARIOS,
];
