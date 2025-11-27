import {
  ConfigMapModel,
  JobModel,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { STATUS_COMPLETION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../../utils/utils';
import {
  SELF_VALIDATION_CHECKUP_IMAGE_KEY,
  SELF_VALIDATION_DRY_RUN_KEY,
  SELF_VALIDATION_PVC_SIZE_KEY,
  SELF_VALIDATION_STORAGE_CAPABILITIES_KEY,
  SELF_VALIDATION_STORAGE_CLASS_KEY,
  SELF_VALIDATION_TEST_SKIPS_KEY,
  SELF_VALIDATION_TEST_SUITES_KEY,
} from '../constants';
import { getResultsConfigMapName } from '../selfValidationResults';

import { addOwnerReference } from './helpers';
import { isJobRunning } from './jobExtraction';
import { selfValidationConfigMap, selfValidationJob, selfValidationPVC } from './resourceTemplates';

// ===========================
// Job Lifecycle Management
// ===========================

export type CreateSelfValidationCheckupOptions = {
  checkupImage: string;
  isDryRun: boolean;
  name: string;
  namespace: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
};

/**
 * Creates a job with its associated PVC and sets up owner reference
 * This is a common pattern used by both create and rerun functions
 * @param jobData - The job data to create
 * @param namespace - Kubernetes namespace
 * @param storageClass - Optional storage class for the PVC
 * @returns The created Job resource
 */
const createJobWithPVC = async (
  jobData: IoK8sApiBatchV1Job,
  namespace: string,
  pvcSize: string,
  storageClass?: string,
): Promise<IoK8sApiBatchV1Job> => {
  const jobName = jobData.metadata.name;

  // Create PVC first
  await k8sCreate({
    data: selfValidationPVC(jobName, namespace, pvcSize, storageClass),
    model: PersistentVolumeClaimModel,
  });

  let job: IoK8sApiBatchV1Job;
  try {
    // Create Job and capture its UID
    job = await k8sCreate<IoK8sApiBatchV1Job>({
      data: jobData,
      model: JobModel,
    });
  } catch (error) {
    kubevirtConsole.error('Failed to create self-validation Job, cleaning up PVC:', error);
    // Attempt to clean up the PVC on failure (best-effort, ignore errors)
    try {
      await k8sDelete({
        model: PersistentVolumeClaimModel,
        resource: { metadata: { name: jobName, namespace } },
      });
    } catch {
      // Ignore cleanup errors (PVC may not exist or already deleted)
    }
    throw error;
  }

  // Best-effort: add owner reference so PVC is GC'd with the Job
  if (job.metadata?.uid) {
    try {
      await addOwnerReference(PersistentVolumeClaimModel, jobName, namespace, {
        apiVersion: 'batch/v1',
        kind: 'Job',
        name: jobName,
        uid: job.metadata.uid,
      });
    } catch (error) {
      kubevirtConsole.warn(
        'Failed to add owner reference to self-validation PVC; PVC may need manual cleanup:',
        error,
      );
    }
  }

  return job;
};

/**
 * Creates a new self-validation checkup with all required resources
 * Creates: PVC, tracking ConfigMap, Job, and sets up owner references for auto-cleanup
 * @param options - Configuration options for the checkup
 * @returns The created Job resource
 */
export const createSelfValidationCheckup = async ({
  checkupImage,
  isDryRun,
  name,
  namespace,
  pvcSize,
  selectedTestSuites,
  storageCapabilities,
  storageClass,
  testSkips,
}: CreateSelfValidationCheckupOptions): Promise<IoK8sApiBatchV1Job> => {
  const jobData = selfValidationJob({
    checkupImage,
    isDryRun,
    name,
    namespace,
    selectedTestSuites,
    storageCapabilities,
    storageClass,
    testSkips,
  });

  await k8sCreate({
    data: selfValidationConfigMap(
      namespace,
      name,
      checkupImage,
      selectedTestSuites,
      isDryRun,
      pvcSize,
      storageClass,
      testSkips,
      storageCapabilities,
    ),
    model: ConfigMapModel,
  });

  return createJobWithPVC(jobData, namespace, pvcSize, storageClass);
};

/**
 * Deletes a single self-validation job and its associated resources
 * Cleans up: job, result ConfigMap, and PVC
 * @param job - The job to delete
 * @throws Error if job deletion fails (ConfigMap deletion failures are logged but not thrown)
 */
export const deleteSelfValidationJob = async (job: IoK8sApiBatchV1Job): Promise<void> => {
  const jobName = job.metadata.name;
  const namespace = job.metadata.namespace;

  // Delete the job (errors propagate to caller)
  await k8sDelete({
    model: JobModel,
    resource: job,
  });

  // Delete the job's results ConfigMap (best-effort, errors are logged but not thrown)
  const resultsConfigMapName = getResultsConfigMapName(jobName);
  try {
    await k8sDelete({
      model: ConfigMapModel,
      resource: {
        metadata: {
          name: resultsConfigMapName,
          namespace,
        },
      },
    });
  } catch (error) {
    kubevirtConsole.warn('Failed to delete results ConfigMap:', error);
  }
};

/**
 * Reruns a self-validation checkup by creating new job with same specs
 * Only deletes currently running jobs, preserves completed/failed jobs for history
 * ConfigMap is the single source of truth for checkup configuration
 * @param configMap - The tracking ConfigMap for the checkup (contains all configuration including checkup image)
 * @param jobs - Array of existing jobs for this checkup
 * @returns The newly created Job resource
 */
export const rerunSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
): Promise<IoK8sApiBatchV1Job> => {
  const { name, namespace } = configMap.metadata;

  // Extract specs from ConfigMap
  const testSuites = configMap?.data?.[SELF_VALIDATION_TEST_SUITES_KEY]?.split(',');

  // Validate required configuration from ConfigMap
  if (!testSuites || testSuites.length === 0) {
    throw new Error('Cannot rerun checkup: ConfigMap is missing test suites data');
  }

  const isDryRun = configMap?.data?.[SELF_VALIDATION_DRY_RUN_KEY] === 'true';
  const imageFromConfigMap = configMap?.data?.[SELF_VALIDATION_CHECKUP_IMAGE_KEY];
  const storageClass = configMap?.data?.[SELF_VALIDATION_STORAGE_CLASS_KEY];
  const testSkips = configMap?.data?.[SELF_VALIDATION_TEST_SKIPS_KEY];
  const pvcSize = configMap?.data?.[SELF_VALIDATION_PVC_SIZE_KEY];
  const storageCapabilities =
    configMap?.data?.[SELF_VALIDATION_STORAGE_CAPABILITIES_KEY]?.split(',');

  if (!imageFromConfigMap) {
    throw new Error('Cannot rerun checkup: no checkup image configured in ConfigMap');
  }

  if (!pvcSize) {
    throw new Error('Cannot rerun checkup: no PVC size configured in ConfigMap');
  }

  // Delete only running jobs (keep completed/failed jobs for history/debugging)
  const runningJobs = jobs.filter((job) => isJobRunning(job));
  const deletionErrors: string[] = [];

  for (const job of runningJobs) {
    try {
      await deleteSelfValidationJob(job);
      kubevirtConsole.log('Deleted running job:', job.metadata.name);
    } catch (error) {
      deletionErrors.push(job.metadata.name);
      kubevirtConsole.error('Failed to delete running job:', error);
    }
  }

  if (deletionErrors.length > 0) {
    throw new Error(
      `Failed to delete running jobs: ${deletionErrors.join(', ')}. Cannot proceed with rerun.`,
    );
  }

  const patchOperations = [];

  if (configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]) {
    patchOperations.push({ op: 'remove', path: `/data/${STATUS_COMPLETION_TIME_STAMP}` });
  }

  patchOperations.push({
    op: 'replace',
    path: `/data/${STATUS_START_TIME_STAMP}`,
    value: new Date().toISOString(),
  });

  try {
    await k8sPatch({
      data: patchOperations,
      model: ConfigMapModel,
      resource: { metadata: { name, namespace } },
    });
  } catch (error) {
    kubevirtConsole.error('Failed to reset initial configmap:', error);
  }

  // Create new Job and PVC
  const jobData = selfValidationJob({
    checkupImage: imageFromConfigMap,
    isDryRun,
    name,
    namespace,
    selectedTestSuites: testSuites,
    storageCapabilities,
    storageClass,
    testSkips,
  });

  return createJobWithPVC(jobData, namespace, pvcSize, storageClass);
};

/**
 * Deletes an entire self-validation checkup and all associated resources
 * Cleans up: all jobs, PVCs, result ConfigMaps, nginx resources (Jobs, Services, Routes, ConfigMaps)
 * @param configMap - The tracking ConfigMap for the checkup
 * @param jobs - Array of all jobs for this checkup
 */
export const deleteSelfValidationCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
): Promise<void> => {
  // Delete all resources for each self-validation job
  for (const job of jobs) {
    try {
      const jobName = job.metadata.name;
      kubevirtConsole.log(`Cleaning up resources for job: ${jobName}`);
      await deleteSelfValidationJob(job);
    } catch (error) {
      kubevirtConsole.error('Failed to delete job resources:', error);
    }
  }

  // Finally, delete the tracking ConfigMap
  try {
    await k8sDelete({
      model: ConfigMapModel,
      resource: configMap,
    });
    kubevirtConsole.log(`Deleted tracking configmap: ${configMap.metadata.name}`);
  } catch (error) {
    kubevirtConsole.error('Failed to delete tracking configmap:', error);
  }
};
