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
export const SELF_VALIDATION_RESULTS_URL_KEY = 'detailed_results_url';
export const SELF_VALIDATION_RESULTS_FILE_KEY = 'detailed_results_file';
export const SELF_VALIDATION_RESULTS_ONLY_LABEL = 'results-only';

export const SELF_VALIDATION_CHECKUP_IMAGE_KEY = 'checkup-image';
export const SELF_VALIDATION_TEST_SUITES_KEY = 'test-suites';
export const SELF_VALIDATION_TEST_SKIPS_KEY = 'test-skips';
export const SELF_VALIDATION_DRY_RUN_KEY = 'dry-run';
export const SELF_VALIDATION_STORAGE_CLASS_KEY = 'storage-class';
export const SELF_VALIDATION_STORAGE_CAPABILITIES_KEY = 'storage-capabilities';
export const SELF_VALIDATION_PVC_SIZE_KEY = 'pvc-size';

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

type SelfValidationTestSuiteName =
  | typeof TEST_SUITE_COMPUTE
  | typeof TEST_SUITE_NETWORK
  | typeof TEST_SUITE_SSP
  | typeof TEST_SUITE_STORAGE
  | typeof TEST_SUITE_TIER2;

type SelfValidationSuiteResult = {
  failed_tests?: string[];
  tests_duration?: string;
  tests_failures?: number;
  tests_passed?: number;
  tests_run?: number;
  tests_skipped?: number;
};

type SelfValidationSummaryResult = {
  total_tests_failed?: number;
  total_tests_passed?: number;
  total_tests_run?: number;
  total_tests_skipped?: number;
};

export type SelfValidationParsedResults = Partial<
  Record<SelfValidationTestSuiteName, SelfValidationSuiteResult>
> & {
  summary: SelfValidationSummaryResult;
};

// ===========================
// Storage Capabilities
// ===========================

export const STORAGE_CAPABILITY_STORAGE_CLASS_RHEL = 'storageClassRhel';
export const STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS = 'storageClassWindows';
export const STORAGE_CAPABILITY_STORAGE_RWX_BLOCK = 'storageRWXBlock';
export const STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM = 'storageRWXFileSystem';
export const STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM = 'storageRWOFileSystem';
export const STORAGE_CAPABILITY_STORAGE_RWO_BLOCK = 'storageRWOBlock';
export const STORAGE_CAPABILITY_STORAGE_CLASS_CSI = 'storageClassCSI';
export const STORAGE_CAPABILITY_STORAGE_SNAPSHOT = 'storageSnapshot';
export const STORAGE_CAPABILITY_ONLINE_RESIZE = 'onlineResize';
export const STORAGE_CAPABILITY_WFFC = 'WFFC';

export const STORAGE_CAPABILITIES = [
  STORAGE_CAPABILITY_STORAGE_CLASS_RHEL,
  STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS,
  STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWO_BLOCK,
  STORAGE_CAPABILITY_STORAGE_CLASS_CSI,
  STORAGE_CAPABILITY_STORAGE_SNAPSHOT,
  STORAGE_CAPABILITY_ONLINE_RESIZE,
  STORAGE_CAPABILITY_WFFC,
];

export const STORAGE_CAPABILITY_OPTIONS = [
  { label: 'Storage Class RHEL', value: STORAGE_CAPABILITY_STORAGE_CLASS_RHEL },
  { label: 'Storage Class Windows', value: STORAGE_CAPABILITY_STORAGE_CLASS_WINDOWS },
  { label: 'Storage RWX Block', value: STORAGE_CAPABILITY_STORAGE_RWX_BLOCK },
  { label: 'Storage RWX FileSystem', value: STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM },
  { label: 'Storage RWO FileSystem', value: STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM },
  { label: 'Storage RWO Block', value: STORAGE_CAPABILITY_STORAGE_RWO_BLOCK },
  { label: 'Storage Class CSI', value: STORAGE_CAPABILITY_STORAGE_CLASS_CSI },
  { label: 'Storage Snapshot', value: STORAGE_CAPABILITY_STORAGE_SNAPSHOT },
  { label: 'Online Resize', value: STORAGE_CAPABILITY_ONLINE_RESIZE },
  { label: 'WFFC', value: STORAGE_CAPABILITY_WFFC },
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
// Progress Annotation Keys
// ===========================

export const TEST_PROGRESS_ANNOTATION_PREFIX = 'test-progress';

type TestProgressOverallKeys =
  | 'test-progress/active-suites'
  | 'test-progress/completed'
  | 'test-progress/failed'
  | 'test-progress/last-updated'
  | 'test-progress/passed'
  | 'test-progress/percent'
  | 'test-progress/total';

type TestProgressSuiteKeys =
  | `test-progress/${SelfValidationTestSuiteName}-completed`
  | `test-progress/${SelfValidationTestSuiteName}-duration`
  | `test-progress/${SelfValidationTestSuiteName}-failed`
  | `test-progress/${SelfValidationTestSuiteName}-finished`
  | `test-progress/${SelfValidationTestSuiteName}-passed`
  | `test-progress/${SelfValidationTestSuiteName}-percent`
  | `test-progress/${SelfValidationTestSuiteName}-total`;

export type TestProgressAnnotations = Partial<
  Record<TestProgressOverallKeys | TestProgressSuiteKeys, string>
>;

// ===========================
// Download Constants
// ===========================

export const DEFAULT_DOWNLOAD_TIMEOUT_MS = 60000;
export const DEFAULT_POLL_INTERVAL_MS = 2000;

// ===========================
// Job Environment Variables
// ===========================

export const JOB_ENV_DRY_RUN = 'DRY_RUN';
export const JOB_ENV_TEST_SUITES = 'TEST_SUITES';
export const JOB_ENV_TEST_SKIPS = 'TEST_SKIPS';
export const JOB_ENV_RESULTS_DIR = 'RESULTS_DIR';
export const JOB_ENV_TIMESTAMP = 'TIMESTAMP';
export const JOB_ENV_STORAGE_CLASS = 'STORAGE_CLASS';
export const JOB_ENV_STORAGE_CAPABILITIES = 'STORAGE_CAPABILITIES';
export const JOB_ENV_POD_NAME = 'POD_NAME';
export const JOB_ENV_POD_NAMESPACE = 'POD_NAMESPACE';

// ===========================
// Job Volume Constants
// ===========================

export const JOB_VOLUME_RESULTS = 'results-volume';
export const JOB_RESULTS_DIR_PATH = '/results';

// ===========================
// Job Results Types
// ===========================

export type JobResultsTimestamps = {
  completionTimestamp?: string;
  startTimestamp?: string;
};

export type JobResults = {
  tests: SelfValidationParsedResults;
  timestamps: JobResultsTimestamps;
};

// ===========================
// Job Parameter Types
// ===========================

export type ValidatedJobParameters = {
  baseName: string;
  checkupImage: string;
  cluster: string;
  isDryRun: boolean;
  namespace: string;
  originalJobName: string;
  pvcName: string;
  resultsConfigMapName: string;
  resultsJobName: string;
  storageCapabilities: string[] | undefined;
  storageClass: string | undefined;
  testSkips: string | undefined;
  testSuites: string[];
  timestamp: string;
};
