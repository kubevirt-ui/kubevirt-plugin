import { JobModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';

import { type ValidatedJobParameters } from '../constants';

import { selfValidationJob } from './resourceTemplates';

/**
 * Creates a self-validation job with CREATE_RESULTS_RESOURCES=true to generate download URL
 * This job reuses the same PVC and timestamp as the original job
 * The job will populate detailed_result_url in the results configmap
 * @param validatedParams - Validated job parameters extracted from the original job
 * @returns The created Job resource
 */
export const createResultsResourcesJob = async (
  validatedParams: ValidatedJobParameters,
): Promise<IoK8sApiBatchV1Job> => {
  const {
    baseName,
    checkupImage,
    cluster,
    isDryRun,
    namespace,
    pvcName,
    resultsJobName,
    storageCapabilities,
    storageClass,
    testSkips,
    testSuites,
    timestamp,
  } = validatedParams;

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
    const job = await kubevirtK8sCreate<IoK8sApiBatchV1Job>({
      cluster,
      data: jobData,
      model: JobModel,
    });
    return job;
  } catch (error: any) {
    // If job already exists (409), fetch and return the existing job
    if (error?.response?.status === 409 || error?.code === 409) {
      const existingJob = await kubevirtK8sGet<IoK8sApiBatchV1Job>({
        cluster,
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
