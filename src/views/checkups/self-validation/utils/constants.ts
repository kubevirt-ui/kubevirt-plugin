import { CHECKUP_STATUS_COLORS } from '../../utils/constants';

// ===========================
// RBAC Constants
// ===========================

export const SELF_VALIDATION_SA = 'ocp-virt-validation-sa';
export const SELF_VALIDATION_ROLE = 'ocp-virt-validation-role';
export const SELF_VALIDATION_CLUSTER_ROLE_BINDING = 'ocp-virt-validation-cluster-admin';

// ===========================
// Checkup Configuration
// ===========================

export const SELF_VALIDATION_LABEL_VALUE = 'kubevirt-self-validation';
export const SELF_VALIDATION_NAME = 'ocp-virt-self-validation';
export const SELF_VALIDATION_RESULTS_KEY = 'self-validation-results';
export const SELF_VALIDATION_CHECKUP_IMAGE_KEY = 'checkup-image';
export const SELF_VALIDATION_TEST_SUITES_KEY = 'test-suites';
export const SELF_VALIDATION_DRY_RUN_KEY = 'dry-run';

export const selfValidationCheckupImageSettings = {
  fallback:
    'registry-proxy.engineering.redhat.com/rh-osbs/container-native-virtualization-ocp-virt-validation-checkup-rhel9:v4.20.0-128',
  name: 'ocp-virt-validation-checkup',
};

// ===========================
// Result Keys
// ===========================

export const TOTAL_TESTS_RUN_KEY = 'total_tests_run';
export const TOTAL_TESTS_PASSED_KEY = 'total_tests_passed';
export const TOTAL_TESTS_FAILED_KEY = 'total_tests_failed';
export const TOTAL_TESTS_SKIPPED_KEY = 'total_tests_skipped';

// ===========================
// Test Suites
// ===========================

export const TEST_SUITE_COMPUTE = 'compute';
export const TEST_SUITE_NETWORK = 'network';
export const TEST_SUITE_STORAGE = 'storage';
export const TEST_SUITE_SSP = 'ssp';
export const TEST_SUITE_TIER2 = 'tier2';

export const TEST_SUITES = [
  TEST_SUITE_COMPUTE,
  TEST_SUITE_NETWORK,
  TEST_SUITE_STORAGE,
  TEST_SUITE_SSP,
  TEST_SUITE_TIER2,
];

export const TEST_SUITE_OPTIONS = [
  { label: 'Compute', value: TEST_SUITE_COMPUTE },
  { label: 'Network', value: TEST_SUITE_NETWORK },
  { label: 'Storage', value: TEST_SUITE_STORAGE },
  { label: 'SSP', value: TEST_SUITE_SSP },
  { label: 'Tier2', value: TEST_SUITE_TIER2 },
];

// ===========================
// Status Constants
// ===========================

export const TEST_STATUS_COMPLETED = 'completed';
export const TEST_STATUS_RUNNING = 'running';
export const TEST_STATUS_FAILED = 'failed';
export const TEST_STATUS_PENDING = 'pending';

export const COLOR_IN_PROGRESS = CHECKUP_STATUS_COLORS.IN_PROGRESS;
export const COLOR_SUCCESS = CHECKUP_STATUS_COLORS.SUCCESS;
export const COLOR_COMPLETED = CHECKUP_STATUS_COLORS.COMPLETED;
export const COLOR_FAILED = CHECKUP_STATUS_COLORS.FAILED;
export const COLOR_SKIPPED = CHECKUP_STATUS_COLORS.SKIPPED;

export type TEST_STATUS =
  | typeof TEST_STATUS_COMPLETED
  | typeof TEST_STATUS_FAILED
  | typeof TEST_STATUS_PENDING
  | typeof TEST_STATUS_RUNNING;

// ===========================
// Naming Helpers
// ===========================

export const getResultsConfigMapName = (jobName: string): string => {
  return `${jobName}-results`;
};
