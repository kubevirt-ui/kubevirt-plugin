/**
 * DataVolume Test Fixtures
 *
 * Test data for parameterized DataVolume creation tests.
 * These fixtures define various DataVolume configurations
 * for YAML-based creation tests.
 *
 * Validation Approach:
 * - DataVolumes are validated by checking if they exist in the cluster
 * - Namespaced resources are verified via GET operations
 * - Timeout values specify how long to poll until the resource appears
 */

import type { DataVolumeConfig } from '@/data-factories/data-volume-factory';

const DATA_VOLUME_TIMEOUT_MS = 60000;
const DATA_VOLUME_HTTP_TIMEOUT_MS = 90000;

/**
 * Base type for DataVolume test case parameters
 */
export type DataVolumeTestCaseParams = {
  dataVolumeConfig: Partial<DataVolumeConfig>;
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  testCaseName: string;
};

/**
 * DataVolume creation test fixtures
 *
 * These are namespaced DataVolume resources.
 * Validation checks if the DataVolume exists in the cluster.
 */
export const DATA_VOLUME_CREATION_FIXTURES: DataVolumeTestCaseParams[] = [
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with Fedora from registry',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'centos.stream9',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/centos-stream:9',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with CentOS Stream from registry',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'centos.stream9',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/centos-stream:9',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with CentOS from registry',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.large',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '50Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with custom storage size',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.xlarge',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with custom instance type',
  },
];

/**
 * Smoke test fixture for DataVolume
 */
export const DATA_VOLUME_SMOKE_TEST_FIXTURE: DataVolumeTestCaseParams = {
  dataVolumeConfig: {
    bindImmediatelyRequested: true,
    defaultInstanceType: 'u1.medium',
    defaultPreference: 'fedora',
    source: {
      registry: {
        url: 'docker://quay.io/containerdisks/fedora:latest',
      },
    },
    storage: {
      requests: {
        storage: '30Gi',
      },
    },
  },
  expectedBehavior: {
    shouldCreate: true,
    timeout: DATA_VOLUME_TIMEOUT_MS,
  },
  testCaseName: 'smoke test: standard Fedora DataVolume',
};

/**
 * Edge case test fixtures for DataVolume
 */
export const DATA_VOLUME_EDGE_CASE_FIXTURES: DataVolumeTestCaseParams[] = [
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.small',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '10Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with minimal storage (10Gi)',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.xlarge',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '100Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_HTTP_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with large storage (100Gi)',
  },
  {
    dataVolumeConfig: {
      bindImmediatelyRequested: false,
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume without bind immediately annotation',
  },
  {
    dataVolumeConfig: {
      customLabels: {
        environment: 'test',
        team: 'qa',
      },
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with custom labels',
  },
  {
    dataVolumeConfig: {
      customAnnotations: {
        description: 'Test DataVolume with custom annotations',
        owner: 'automation-team',
      },
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with custom annotations',
  },
  {
    dataVolumeConfig: {
      defaultInstanceType: 'u1.medium',
      defaultPreference: 'fedora',
      source: {
        http: {
          url: 'https://download.cirros-cloud.net/0.5.2/cirros-0.5.2-x86_64-disk.img',
        },
      },
      storage: {
        requests: {
          storage: '30Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_HTTP_TIMEOUT_MS, // HTTP downloads may take longer
    },
    testCaseName: 'DataVolume from HTTP source',
  },
];

/**
 * DataVolume configuration variations for comprehensive testing
 */
export const DATA_VOLUME_COMPREHENSIVE_FIXTURES: DataVolumeTestCaseParams[] = [
  {
    dataVolumeConfig: {
      bindImmediatelyRequested: true,
      customAnnotations: {
        description: 'Comprehensive test DataVolume',
        'managed-by': 'automation',
      },
      customLabels: {
        environment: 'production',
        tier: 'frontend',
      },
      defaultInstanceType: 'u1.large',
      defaultPreference: 'fedora',
      source: {
        registry: {
          url: 'docker://quay.io/containerdisks/fedora:latest',
        },
      },
      storage: {
        requests: {
          storage: '50Gi',
        },
      },
    },
    expectedBehavior: {
      shouldCreate: true,
      timeout: DATA_VOLUME_TIMEOUT_MS,
    },
    testCaseName: 'DataVolume with all metadata options',
  },
];
