import { JobModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { k8sCreate, k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { CONFIGMAP_NAME } from '../../../utils/utils';

import {
  getCheckupImageFromJob,
  getDryRunFromJob,
  getPVCNameFromJob,
  getStorageCapabilitiesFromJob,
  getStorageClassFromJob,
  getTestSkipsFromJob,
  getTestSuitesFromJob,
  getTimestampFromJob,
} from './jobExtraction';
import { selfValidationJob } from './resourceTemplates';

/**
 * Creates a self-validation job with CREATE_RESULTS_RESOURCES=true to generate download URL
 * This job reuses the same PVC and timestamp as the original job
 * The job will populate detailed_result_url in the results configmap
 * @param originalJob - The original job to extract parameters from
 * @returns The created Job resource
 */
export const createResultsResourcesJob = async (
  originalJob: IoK8sApiBatchV1Job,
): Promise<IoK8sApiBatchV1Job> => {
  const namespace = originalJob.metadata.namespace;
  if (!namespace) {
    throw new Error('Job namespace is required');
  }

  // Extract timestamp from original job
  const timestamp = getTimestampFromJob(originalJob);
  if (!timestamp) {
    throw new Error('Could not extract timestamp from original job');
  }

  // Extract all parameters from original job
  const checkupImage = getCheckupImageFromJob(originalJob);
  if (!checkupImage) {
    throw new Error('Could not extract checkup image from original job');
  }

  const testSuites = getTestSuitesFromJob(originalJob);
  if (!testSuites || testSuites.length === 0) {
    throw new Error('Could not extract test suites from original job');
  }

  const isDryRun = getDryRunFromJob(originalJob);
  const storageClass = getStorageClassFromJob(originalJob);
  const testSkips = getTestSkipsFromJob(originalJob);
  const storageCapabilities = getStorageCapabilitiesFromJob(originalJob);

  // Extract PVC name from original job (to reuse it)
  const pvcName = getPVCNameFromJob(originalJob);
  if (!pvcName) {
    throw new Error('Could not extract PVC name from original job');
  }

  // Extract base name from original job's CONFIGMAP_NAME env var
  // CONFIGMAP_NAME format: <jobName>-results
  const configMapNameEnv = originalJob.spec?.template?.spec?.containers?.[0]?.env?.find(
    (env) => env.name === CONFIGMAP_NAME,
  );
  const resultsConfigMapName = configMapNameEnv?.value;
  if (!resultsConfigMapName) {
    throw new Error('Could not extract results configmap name from original job');
  }

  // Use the original job name with -results suffix
  const originalJobName = originalJob.metadata.name;
  if (!originalJobName) {
    throw new Error('Could not extract job name from original job');
  }
  const resultsJobName = `${originalJobName}-results`;

  // Extract base name: remove "-results" suffix and the random number
  // Format: <baseName>-<number>-results -> <baseName>
  const baseNameRegex = /^(.+)-\d+-results$/;
  const baseNameMatch = baseNameRegex.exec(resultsConfigMapName);
  const baseName = baseNameMatch ? baseNameMatch[1] : resultsConfigMapName.replace(/-results$/, '');

  // Create the job with CREATE_RESULTS_RESOURCES=true
  const jobData = selfValidationJob({
    checkupImage,
    createResultsResources: true,
    isDryRun,
    jobNameOverride: resultsJobName,
    name: baseName,
    namespace,
    pvcName,
    selectedTestSuites: testSuites,
    storageCapabilities,
    storageClass,
    testSkips,
    timestamp,
  });

  // Create the job (no PVC creation needed - reusing existing one)
  // Handle idempotency: if job already exists (409), fetch and return it
  try {
    const job = await k8sCreate<IoK8sApiBatchV1Job>({
      data: jobData,
      model: JobModel,
    });
    return job;
  } catch (error: any) {
    // If job already exists (409), fetch and return the existing job
    if (error?.response?.status === 409 || error?.code === 409) {
      const existingJob = await k8sGet<IoK8sApiBatchV1Job>({
        model: JobModel,
        name: resultsJobName,
        ns: namespace,
      });
      return existingJob;
    }
    // Re-throw other errors
    throw error;
  }
};
