import { JobModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sList } from '@openshift-console/dynamic-plugin-sdk';

import { getJobContainers, isJobRunning, KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import {
  JOB_ENV_ACCEPT_WINDOWS_EULA,
  JOB_ENV_DRY_RUN,
  JOB_ENV_STORAGE_CAPABILITIES,
  JOB_ENV_STORAGE_CLASS,
  JOB_ENV_TEST_SKIPS,
  JOB_ENV_TEST_SUITES,
  JOB_ENV_TIMESTAMP,
  JOB_ENV_WIN_IMAGE_DOWNLOAD_URL,
  JOB_ENV_WIN_IMAGE_NAME,
  JOB_VOLUME_RESULTS,
  SELF_VALIDATION_LABEL_VALUE,
} from '../constants';

// ===========================
// Job Information Extraction
// ===========================

const getEnvVarFromJob = (job: IoK8sApiBatchV1Job, envName: string): string | undefined => {
  const env = getJobContainers(job)?.[0]?.env;
  return env?.find((e) => e.name === envName)?.value;
};

export const getTestSuitesFromJob = (job: IoK8sApiBatchV1Job): string[] =>
  getEnvVarFromJob(job, JOB_ENV_TEST_SUITES)
    ?.split(',')
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

export const getDryRunFromJob = (job: IoK8sApiBatchV1Job): boolean =>
  getEnvVarFromJob(job, JOB_ENV_DRY_RUN) === 'true';

export const getAcceptWindowsEulaFromJob = (job: IoK8sApiBatchV1Job): boolean =>
  getEnvVarFromJob(job, JOB_ENV_ACCEPT_WINDOWS_EULA) === 'true';

export const getWinImageDownloadUrlFromJob = (job: IoK8sApiBatchV1Job): string | undefined =>
  getEnvVarFromJob(job, JOB_ENV_WIN_IMAGE_DOWNLOAD_URL);

export const getWinImageNameFromJob = (job: IoK8sApiBatchV1Job): string | undefined =>
  getEnvVarFromJob(job, JOB_ENV_WIN_IMAGE_NAME);

export const getTimestampFromJob = (job: IoK8sApiBatchV1Job): null | string =>
  getEnvVarFromJob(job, JOB_ENV_TIMESTAMP) ?? null;

export const getStorageClassFromJob = (job: IoK8sApiBatchV1Job): string | undefined =>
  getEnvVarFromJob(job, JOB_ENV_STORAGE_CLASS);

export const getTestSkipsFromJob = (job: IoK8sApiBatchV1Job): string | undefined =>
  getEnvVarFromJob(job, JOB_ENV_TEST_SKIPS);

export const getStorageCapabilitiesFromJob = (job: IoK8sApiBatchV1Job): string[] | undefined => {
  const value = getEnvVarFromJob(job, JOB_ENV_STORAGE_CAPABILITIES);
  if (value === undefined) return undefined;
  const tokens = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.length ? tokens : undefined;
};

export const getCheckupImageFromJob = (job: IoK8sApiBatchV1Job): string =>
  getJobContainers(job)?.[0]?.image || '';

export { isJobRunning } from '../../../utils/utils';

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

export const getPVCNameFromJob = (job: IoK8sApiBatchV1Job): string | undefined => {
  const volumes = job?.spec?.template?.spec?.volumes;
  const resultsVolume = volumes?.find((volume) => volume.name === JOB_VOLUME_RESULTS);
  return resultsVolume?.persistentVolumeClaim?.claimName;
};
