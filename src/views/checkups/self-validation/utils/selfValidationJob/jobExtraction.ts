import { JobModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sList } from '@openshift-console/dynamic-plugin-sdk';

import { getJobContainers, KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import {
  JOB_ENV_DRY_RUN,
  JOB_ENV_STORAGE_CAPABILITIES,
  JOB_ENV_STORAGE_CLASS,
  JOB_ENV_TEST_SKIPS,
  JOB_ENV_TEST_SUITES,
  JOB_ENV_TIMESTAMP,
  JOB_VOLUME_RESULTS,
  SELF_VALIDATION_LABEL_VALUE,
} from '../constants';

// ===========================
// Job Information Extraction
// ===========================

export const getTestSuitesFromJob = (job: IoK8sApiBatchV1Job): string[] => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return [];
  }

  const testSuitesEnv = containers[0].env.find((env) => env.name === JOB_ENV_TEST_SUITES);

  if (!testSuitesEnv?.value) {
    return [];
  }

  return testSuitesEnv.value.split(',');
};

export const getDryRunFromJob = (job: IoK8sApiBatchV1Job): boolean => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return false;
  }

  const dryRunEnv = containers[0].env.find((env) => env.name === JOB_ENV_DRY_RUN);

  return dryRunEnv?.value === 'true';
};

export const getCheckupImageFromJob = (job: IoK8sApiBatchV1Job): string => {
  return getJobContainers(job)?.[0]?.image || '';
};

export const isJobRunning = (job: IoK8sApiBatchV1Job): boolean => {
  return !!job?.status?.active;
};

/**
 * Fetches all running self-validation jobs across the cluster
 * @returns Array of running job objects
 */
export const getAllRunningSelfValidationJobs = async (): Promise<IoK8sApiBatchV1Job[]> => {
  try {
    const response = await k8sList<IoK8sApiBatchV1Job>({
      model: JobModel,
      queryParams: {
        labelSelector: {
          matchLabels: {
            [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
          },
        },
      },
    });

    const jobs = Array.isArray(response) ? response : response?.items || [];
    return jobs.filter(isJobRunning);
  } catch (error) {
    kubevirtConsole.error('Failed to fetch running self-validation jobs:', error);
    return [];
  }
};

export const getTimestampFromJob = (job: IoK8sApiBatchV1Job): null | string => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return null;
  }

  const timestampEnv = containers[0].env.find((env) => env.name === JOB_ENV_TIMESTAMP);

  return timestampEnv?.value || null;
};

export const getStorageClassFromJob = (job: IoK8sApiBatchV1Job): string | undefined => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return undefined;
  }

  const storageClassEnv = containers[0].env.find((env) => env.name === JOB_ENV_STORAGE_CLASS);

  return storageClassEnv?.value;
};

export const getTestSkipsFromJob = (job: IoK8sApiBatchV1Job): string | undefined => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return undefined;
  }

  const testSkipsEnv = containers[0].env.find((env) => env.name === JOB_ENV_TEST_SKIPS);

  return testSkipsEnv?.value;
};

export const getStorageCapabilitiesFromJob = (job: IoK8sApiBatchV1Job): string[] | undefined => {
  const containers = getJobContainers(job);
  if (!containers?.[0]?.env) {
    return undefined;
  }

  const storageCapabilitiesEnv = containers[0].env.find(
    (env) => env.name === JOB_ENV_STORAGE_CAPABILITIES,
  );

  if (!storageCapabilitiesEnv?.value) {
    return undefined;
  }

  return storageCapabilitiesEnv.value.split(',');
};

export const getPVCNameFromJob = (job: IoK8sApiBatchV1Job): string | undefined => {
  const volumes = job?.spec?.template?.spec?.volumes;
  const resultsVolume = volumes?.find((volume) => volume.name === JOB_VOLUME_RESULTS);
  return resultsVolume?.persistentVolumeClaim?.claimName;
};
