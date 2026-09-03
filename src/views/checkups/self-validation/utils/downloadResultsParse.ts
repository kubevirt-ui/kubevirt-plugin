// Extracted from downloadResults.ts
// Root: src/views/checkups/self-validation/utils/downloadResults.ts

import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { SELF_VALIDATION_RESULTS_FILE_KEY, SELF_VALIDATION_RESULTS_URL_KEY } from './constants';
import { getTimestampFromJob } from './selfValidationJob/jobExtraction';
import { getResultsConfigMapName } from './selfValidationResults';

export const getDefaultErrorMessage = (t: TFunction): string => {
  return t('Failed to download results. Please try again later.');
};

export type DetailedResultsData = {
  detailedDownloadUrl: string;
  detailedResultsFile: string;
  detailedResultsUrl: string;
};

export const getDetailedResultsData = (
  configMap: IoK8sApiCoreV1ConfigMap,
): DetailedResultsData | null => {
  const detailedResultsUrl = configMap?.data?.[SELF_VALIDATION_RESULTS_URL_KEY]?.trim();
  const detailedResultsFile = configMap?.data?.[SELF_VALIDATION_RESULTS_FILE_KEY]?.trim();

  if (!detailedResultsUrl || !detailedResultsFile) {
    return null;
  }

  try {
    new URL(detailedResultsUrl);
  } catch {
    kubevirtConsole.warn('Invalid URL format in ConfigMap:', detailedResultsUrl);
    return null;
  }

  const baseUrl = detailedResultsUrl.endsWith('/')
    ? detailedResultsUrl.slice(0, -1)
    : detailedResultsUrl;
  const detailedDownloadUrl = `${baseUrl}/${detailedResultsFile}`;

  return { detailedDownloadUrl, detailedResultsFile, detailedResultsUrl };
};

export const validateJobTimestamp = (job: IoK8sApiBatchV1Job): null | string => {
  const timestamp = getTimestampFromJob(job);
  if (!timestamp) {
    kubevirtConsole.error('Could not extract timestamp from job:', job.metadata.name);
    return null;
  }
  return timestamp;
};

export type DownloadInputValidationResult =
  | { configMapName: string; valid: true }
  | { valid: false };

const validateJobAndGetConfigMapName = (
  job: IoK8sApiBatchV1Job,
): { configMapName: string } | { error: boolean } => {
  const timestamp = validateJobTimestamp(job);
  if (!timestamp) {
    kubevirtConsole.error(`Could not extract timestamp from job: ${job.metadata?.name}`);
    return { error: true };
  }
  return { configMapName: getResultsConfigMapName(job.metadata.name) };
};

export const validateDownloadInputs = (
  job: IoK8sApiBatchV1Job | null,
  namespace: null | string,
): DownloadInputValidationResult => {
  if (!job || !namespace) {
    kubevirtConsole.error(
      `Job and namespace required to download results. Job: ${job?.metadata?.name}, Namespace: ${namespace}`,
    );
    return { valid: false };
  }

  const configMapNameResult = validateJobAndGetConfigMapName(job);
  if ('error' in configMapNameResult) {
    return { valid: false };
  }

  return { configMapName: configMapNameResult.configMapName, valid: true };
};
