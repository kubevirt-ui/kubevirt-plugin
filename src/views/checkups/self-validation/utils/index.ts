// Re-export all utilities from the consolidated files

// Constants
export * from './constants';

// Job lifecycle and helpers
export {
  addOwnerReference,
  createSelfValidationCheckup,
  deleteSelfValidationCheckup,
  deleteSelfValidationJob,
  getAllRunningSelfValidationJobs,
  getCheckupImageFromJob,
  getDryRunFromJob,
  getTestSuitesFromJob,
  getTimestampFromJob,
  installSelfValidationPermissions,
  isJobRunning,
  removeSelfValidationPermissions,
  rerunSelfValidationCheckup,
  selfValidationJob,
  selfValidationPVC,
} from './selfValidationJob';

// Messages and UI helpers
export { getRunningCheckupErrorMessage } from './selfValidationMessages';

// Nginx server management
export { createDetailedResultsViewer, waitForNginxServer } from './createDetailedResultsViewer';

// RBAC permissions
export { installPermissions, uninstallPermissions } from './selfValidationPermissions';

// Results parsing and status
export {
  formatGoDuration,
  formatStatusTimestamp,
  getCheckupsSelfValidationListFilters,
  getConfigMapStatus,
  getOverallProgressFromJob,
  getSummaryText,
  parseFailedTest,
  parseResults,
} from './selfValidationResults';
