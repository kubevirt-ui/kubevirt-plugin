// Re-export all utilities from the consolidated files

// Constants
export type { JobResults, JobResultsTimestamps, TEST_STATUS } from './constants';
export * from './constants';

// Job lifecycle and helpers
export {
  addOwnerReference,
  createResultsResourcesJob,
  createSelfValidationCheckup,
  deleteSelfValidationCheckup,
  deleteSelfValidationJob,
  getAllRunningSelfValidationJobs,
  getCheckupImageFromJob,
  getDryRunFromJob,
  getPVCNameFromJob,
  getStorageCapabilitiesFromJob,
  getStorageClassFromJob,
  getTestSkipsFromJob,
  getTestSuitesFromJob,
  getTimestampFromJob,
  isJobRunning,
  rerunSelfValidationCheckup,
  selfValidationJob,
  selfValidationPVC,
} from './selfValidationJob';

// Messages and UI helpers
export { getRunningCheckupErrorMessage } from './selfValidationMessages';

// RBAC permissions
export {
  installPermissions as installSelfValidationPermissions,
  uninstallPermissions as removeSelfValidationPermissions,
} from './selfValidationPermissions';

// Results parsing and status
export {
  formatGoDuration,
  formatStatusTimestamp,
  getCheckupsSelfValidationListFilters,
  getCompletedSummaryText,
  getInProgressSummaryText,
  getOverallProgressFromJob,
  getResultsConfigMapName,
  parseFailedTest,
  parseResults,
} from './selfValidationResults';

// Download results utilities
export type {
  DownloadResultsErrorHandler,
  DownloadResultsOptions,
  DownloadResultsProgressHandler,
} from './downloadResults';
export { downloadResults } from './downloadResults';
