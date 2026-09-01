import { CHECKUP_STATUS_COLORS } from '../../utils/constants';
import {
  type TEST_SUITE_COMPUTE,
  type TEST_SUITE_NETWORK,
  type TEST_SUITE_SSP,
  type TEST_SUITE_STORAGE,
  type TEST_SUITE_TIER2,
} from './checkupConfigConstants';

export * from './checkupConfigConstants';
export * from './rbacConstants';

export const TOTAL_TESTS_RUN_KEY = 'total_tests_run';
export const TOTAL_TESTS_PASSED_KEY = 'total_tests_passed';
export const TOTAL_TESTS_FAILED_KEY = 'total_tests_failed';
export const TOTAL_TESTS_SKIPPED_KEY = 'total_tests_skipped';

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

export const TEST_STATUS_COMPLETED = 'completed';
export const TEST_STATUS_RUNNING = 'running';
export const TEST_STATUS_FAILED = 'failed';
export const TEST_STATUS_PENDING = 'pending';

export const COLOR_IN_PROGRESS = CHECKUP_STATUS_COLORS.IN_PROGRESS;
export const COLOR_SUCCESS = CHECKUP_STATUS_COLORS.SUCCESS;
export const COLOR_COMPLETED = CHECKUP_STATUS_COLORS.COMPLETED;
export const COLOR_FAILED = CHECKUP_STATUS_COLORS.FAILED;
export const COLOR_SKIPPED = CHECKUP_STATUS_COLORS.SKIPPED;

export type TestStatus =
  | typeof TEST_STATUS_COMPLETED
  | typeof TEST_STATUS_FAILED
  | typeof TEST_STATUS_PENDING
  | typeof TEST_STATUS_RUNNING;

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

export const DEFAULT_DOWNLOAD_TIMEOUT_MS = 60000;
export const DEFAULT_POLL_INTERVAL_MS = 2000;

export const JOB_ENV_DRY_RUN = 'DRY_RUN';
export const JOB_ENV_ACCEPT_WINDOWS_EULA = 'ACCEPT_WINDOWS_EULA';
export const JOB_ENV_WIN_IMAGE_DOWNLOAD_URL = 'WIN_IMAGE_DOWNLOAD_URL';
export const JOB_ENV_TEST_SUITES = 'TEST_SUITES';
export const JOB_ENV_TEST_SKIPS = 'TEST_SKIPS';
export const JOB_ENV_RESULTS_DIR = 'RESULTS_DIR';
export const JOB_ENV_TIMESTAMP = 'TIMESTAMP';
export const JOB_ENV_STORAGE_CLASS = 'STORAGE_CLASS';
export const JOB_ENV_STORAGE_CAPABILITIES = 'STORAGE_CAPABILITIES';
export const JOB_ENV_POD_NAME = 'POD_NAME';
export const JOB_ENV_POD_NAMESPACE = 'POD_NAMESPACE';

export const JOB_VOLUME_RESULTS = 'results-volume';
export const JOB_RESULTS_DIR_PATH = '/results';

export type JobResultsTimestamps = {
  completionTimestamp?: string;
  startTimestamp?: string;
};

export type JobResults = {
  tests: SelfValidationParsedResults;
  timestamps: JobResultsTimestamps;
};

export type ValidatedJobParameters = {
  acceptWindowsEula: boolean;
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
  winImageDownloadUrl: string | undefined;
};
