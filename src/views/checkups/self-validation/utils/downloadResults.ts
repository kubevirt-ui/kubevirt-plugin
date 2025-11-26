import { TFunction } from 'react-i18next';
import axios from 'axios';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { getTimestampFromJob } from './selfValidationJob/jobExtraction';
import { createResultsResourcesJob } from './selfValidationJob/resultsResources';
import {
  DEFAULT_DOWNLOAD_TIMEOUT_MS,
  DEFAULT_POLL_INTERVAL_MS,
  SELF_VALIDATION_RESULTS_FILE_KEY,
  SELF_VALIDATION_RESULTS_URL_KEY,
} from './constants';
import { getResultsConfigMapName } from './selfValidationResults';

export type DownloadResultsErrorHandler = (errorMessage: string, url?: string) => void;
export type DownloadResultsProgressHandler = (isWaiting: boolean) => void;

type DetailedResultsData = {
  detailedDownloadUrl: string;
  detailedResultsFile: string;
  detailedResultsUrl: string;
};

/**
 * Extracts and validates detailed results data from a ConfigMap
 * @param configMap - The ConfigMap containing the results data
 * @returns Detailed results data object or null if data is invalid or missing
 */
const getDetailedResultsData = (configMap: IoK8sApiCoreV1ConfigMap): DetailedResultsData | null => {
  const detailedResultsUrl = configMap?.data?.[SELF_VALIDATION_RESULTS_URL_KEY]?.trim();
  const detailedResultsFile = configMap?.data?.[SELF_VALIDATION_RESULTS_FILE_KEY]?.trim();

  // Validate that both URL and filename are present and non-empty
  if (!detailedResultsUrl || !detailedResultsFile) {
    return null;
  }

  // Validate URL format
  try {
    new URL(detailedResultsUrl);
  } catch {
    kubevirtConsole.warn('Invalid URL format in ConfigMap:', detailedResultsUrl);
    return null;
  }

  // Handle trailing slashes properly
  const baseUrl = detailedResultsUrl.endsWith('/')
    ? detailedResultsUrl.slice(0, -1)
    : detailedResultsUrl;
  const detailedDownloadUrl = `${baseUrl}/${detailedResultsFile}`;

  return { detailedDownloadUrl, detailedResultsFile, detailedResultsUrl };
};
/**
 * Polls the results configmap for detailed results data
 * @param resultsConfigMapName - Name of the results configmap
 * @param namespace - Namespace of the configmap
 * @param timeoutMs - Maximum time to wait in milliseconds (default: DEFAULT_DOWNLOAD_TIMEOUT_MS)
 * @param pollIntervalMs - Interval between polls in milliseconds (default: DEFAULT_POLL_INTERVAL_MS)
 * @returns Promise with the ConfigMap containing valid results data or null if it times out
 */
const waitForDetailedResultsConfigMap = async (
  resultsConfigMapName: string,
  namespace: string,
  timeoutMs: number = DEFAULT_DOWNLOAD_TIMEOUT_MS,
  pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const resultsConfigMap = await k8sGet({
        model: ConfigMapModel,
        name: resultsConfigMapName,
        ns: namespace,
      });
      const resultsData = getDetailedResultsData(resultsConfigMap);

      if (resultsData) {
        return resultsConfigMap;
      }
    } catch (error) {
      kubevirtConsole.warn('Error polling for detailed results:', error);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return null;
};

type HealthCheckResult = {
  healthUrl: string;
  isCertificateError: boolean;
  isHealthy: boolean;
};

/**
 * Checks if the health endpoint is accessible
 * @param url - The base URL to check
 * @returns Promise with health check result including certificate error status
 */
const checkHealthEndpoint = async (url: string): Promise<HealthCheckResult> => {
  const healthUrl = `${url}/health`;
  try {
    await axios.get(healthUrl);
    return { healthUrl, isCertificateError: false, isHealthy: true };
  } catch (catchError) {
    // The GET request will return an error everytime, but it will be undefined only if the certificate is invalid.
    const isCertificateError = catchError?.response?.data === undefined;
    if (isCertificateError) {
      kubevirtConsole.warn('Health check failed due to invalid certificate:', healthUrl);
      return { healthUrl, isCertificateError: true, isHealthy: false };
    }
    // Other errors (network, server errors, etc.) - health check failed
    kubevirtConsole.warn('Health check failed:', catchError);
    return { healthUrl, isCertificateError: false, isHealthy: false };
  }
};

/**
 * Triggers a file download in the browser
 * @param url - The URL to download
 * @param filename - The filename for the download
 */
const downloadResultsFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export type DownloadResultsOptions = {
  job: IoK8sApiBatchV1Job;
  namespace: string;
  onError: DownloadResultsErrorHandler;
  onProgress?: DownloadResultsProgressHandler;
  t: TFunction;
};

/**
 * Validates and extracts timestamp from a job
 * @param job - The job to extract timestamp from
 * @returns The timestamp string or null if extraction fails
 */
const validateJobTimestamp = (job: IoK8sApiBatchV1Job): null | string => {
  const timestamp = getTimestampFromJob(job);
  if (!timestamp) {
    kubevirtConsole.error('Could not extract timestamp from job:', job.metadata.name);
    return null;
  }
  return timestamp;
};

type TryDownloadResult = {
  isCertificateError: boolean;
  success: boolean;
};

/**
 * Attempts to download results from existing ConfigMap data
 * @param resultsConfigMap - The ConfigMap containing results data
 * @param onError - Error handler callback
 * @param t - Translation function
 * @returns Result object indicating success and certificate error status
 */
const tryDownloadExistingResults = async (
  resultsConfigMap: IoK8sApiCoreV1ConfigMap,
  onError: DownloadResultsErrorHandler,
  t: TFunction,
): Promise<TryDownloadResult> => {
  const resultsData = getDetailedResultsData(resultsConfigMap);
  if (!resultsData) {
    return { isCertificateError: false, success: false };
  }

  const { detailedDownloadUrl, detailedResultsFile, detailedResultsUrl } = resultsData;

  // Check health endpoint
  const healthCheckResult = await checkHealthEndpoint(detailedResultsUrl);
  if (healthCheckResult.isHealthy) {
    downloadResultsFile(detailedDownloadUrl, detailedResultsFile);
    return { isCertificateError: false, success: true };
  }

  // Certificate error detected - show modal with link to approve certificate
  if (healthCheckResult.isCertificateError) {
    onError(
      t('It seems that your browser does not trust the certificate of the results server.'),
      healthCheckResult.healthUrl,
    );
    return { isCertificateError: true, success: false };
  }

  // Health check failed (non-certificate error), remove stale data from configmap
  try {
    await k8sPatch({
      data: [
        {
          op: 'remove',
          path: `/data/${SELF_VALIDATION_RESULTS_FILE_KEY}`,
        },
        {
          op: 'remove',
          path: `/data/${SELF_VALIDATION_RESULTS_URL_KEY}`,
        },
      ],
      model: ConfigMapModel,
      resource: resultsConfigMap,
    });
  } catch (patchError) {
    kubevirtConsole.warn('Failed to remove stale URL from configmap:', patchError);
    // Continue anyway - we'll create a new job
  }

  return { isCertificateError: false, success: false };
};

/**
 * Creates a results resources job and waits for the results ConfigMap to be ready
 * @param job - The job to create results resources for
 * @param resultsConfigMapName - Name of the results ConfigMap
 * @param namespace - Namespace for the resources
 * @returns The ConfigMap with results data or null if timeout
 */
const createAndWaitForResults = async (
  job: IoK8sApiBatchV1Job,
  resultsConfigMapName: string,
  namespace: string,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  await createResultsResourcesJob(job);

  const configMap = await waitForDetailedResultsConfigMap(
    resultsConfigMapName,
    namespace,
    DEFAULT_DOWNLOAD_TIMEOUT_MS,
  );

  return configMap;
};

/**
 * Main function to handle downloading results
 * Checks for existing URL, validates health, creates job if needed, and downloads the file
 * @param options - Configuration options for downloading results
 * @returns Promise that resolves when download is complete or fails
 */
export const downloadResults = async (options: DownloadResultsOptions): Promise<void> => {
  const { job, namespace, onError, onProgress, t } = options;
  const errorMessage = t('Failed to download results. Please try again later.');

  try {
    onProgress?.(true);

    // Validate timestamp
    const timestamp = validateJobTimestamp(job);
    if (!timestamp) {
      onError(t('Could not extract timestamp from job.'));
      return;
    }

    const resultsConfigMapName = getResultsConfigMapName(job.metadata.name);

    // Check if results already exist in ConfigMap
    let resultsConfigMap: IoK8sApiCoreV1ConfigMap | null = null;
    try {
      resultsConfigMap = await k8sGet({
        model: ConfigMapModel,
        name: resultsConfigMapName,
        ns: namespace,
      });
    } catch (e: any) {
      // Treat NotFound (404) as "no existing results" and fall back to creating resources;
      // rethrow other errors so they surface to the caller.
      const status = e?.response?.status ?? e?.status;
      if (status && status !== 404) {
        throw e;
      }
      // 404 or no status - treat as missing ConfigMap, continue to create resources
    }

    if (resultsConfigMap) {
      const downloadResult = await tryDownloadExistingResults(resultsConfigMap, onError, t);
      if (downloadResult.success || downloadResult.isCertificateError) {
        return;
      }
    }

    // No valid results found, create new job and wait for results
    const configMap = await createAndWaitForResults(job, resultsConfigMapName, namespace);

    if (configMap) {
      const newDownloadResult = await tryDownloadExistingResults(configMap, onError, t);
      if (!newDownloadResult.success && !newDownloadResult.isCertificateError) {
        // Only show generic error if it wasn't already handled (e.g., certificate error)
        // Certificate errors are already handled in tryDownloadExistingResults
        onError(errorMessage);
      }
    } else {
      onError(errorMessage);
    }
  } catch (error) {
    kubevirtConsole.error('Failed to download results:', error);
    onError(errorMessage + (error instanceof Error ? ` ${error.message}` : ''));
  } finally {
    onProgress?.(false);
  }
};
