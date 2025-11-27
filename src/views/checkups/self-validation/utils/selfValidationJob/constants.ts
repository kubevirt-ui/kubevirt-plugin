// ===========================
// Job Container Constants
// ===========================

export const JOB_CONTAINER_NAME = 'self-validation-checkup';
export const JOB_IMAGE_PULL_POLICY = 'Always';
export const JOB_RESTART_POLICY = 'Never';
export const JOB_FS_GROUP = 1001;

// ===========================
// Job Resource Limits
// ===========================

export const JOB_RESOURCE_LIMITS_CPU = '2';
export const JOB_RESOURCE_LIMITS_MEMORY = '4Gi';
export const JOB_RESOURCE_LIMITS_EPHEMERAL_STORAGE = '10Gi';

export const JOB_RESOURCE_REQUESTS_CPU = '500m';
export const JOB_RESOURCE_REQUESTS_MEMORY = '1Gi';
export const JOB_RESOURCE_REQUESTS_EPHEMERAL_STORAGE = '5Gi';

// ===========================
// PVC Constants
// ===========================

export const PVC_ACCESS_MODE = 'ReadWriteOnce';
export const PVC_STORAGE_SIZE = '10Gi'; // Default/fallback size
export const PVC_STORAGE_SIZE_PER_SUITE = '2Gi';
export const PVC_STORAGE_SIZE_TIER2 = '10Gi';

// ===========================
// Job API Constants
// ===========================

export const JOB_API_VERSION = 'batch/v1';
export const JOB_BACKOFF_LIMIT = 0;
