import { TFunction } from 'react-i18next';
import axios from 'axios';
import { saveAs } from 'file-saver';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { CONFIGMAP_NAME, extractConfigMapBaseName } from '../../utils/utils';

import {
  getCheckupImageFromJob,
  getDryRunFromJob,
  getPVCNameFromJob,
  getStorageCapabilitiesFromJob,
  getStorageClassFromJob,
  getTestSkipsFromJob,
  getTestSuitesFromJob,
  getTimestampFromJob,
} from './selfValidationJob/jobExtraction';
import { createResultsResourcesJob } from './selfValidationJob/resultsResources';
import {
  DEFAULT_DOWNLOAD_TIMEOUT_MS,
  DEFAULT_POLL_INTERVAL_MS,
  SELF_VALIDATION_RESULTS_FILE_KEY,
  SELF_VALIDATION_RESULTS_URL_KEY,
  ValidatedJobParameters,
} from './constants';
import { getResultsConfigMapName } from './selfValidationResults';

type DetailedResultsData = {
  detailedDownloadUrl: string;
  detailedResultsFile: string;
  detailedResultsUrl: string;
};

export const getDefaultErrorMessage = (t: TFunction): string => {
  return t('Failed to download results. Please try again later.');
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
  cluster: string,
  timeoutMs: number = DEFAULT_DOWNLOAD_TIMEOUT_MS,
  pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const resultsConfigMap = await kubevirtK8sGet({
        cluster,
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
 * Triggers a file download in the browser using axios and file-saver
 * @param url - The URL to download
 * @param filename - The filename for the download
 * @returns true if download succeeded, false otherwise
 */
const downloadResultsFile = async (url: string, filename: string): Promise<boolean> => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
    });

    if (response.status !== 200) {
      kubevirtConsole.error(
        'There was an error downloading the file:',
        `Network response was not ok: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const blob = new Blob([response.data]);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    kubevirtConsole.error('There was an error downloading the file:', error);
    return false;
  }
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
  certificateUrl?: string;
  error: null | string;
  success: boolean;
};

/**
 * Attempts to download results from existing ConfigMap data
 * @param resultsConfigMap - The ConfigMap containing results data
 * @param t - Translation function
 * @returns Result object indicating success, certificate error status, and error message
 */
const tryDownloadExistingResults = async (
  resultsConfigMap: IoK8sApiCoreV1ConfigMap,
  t: TFunction,
): Promise<TryDownloadResult> => {
  const resultsData = getDetailedResultsData(resultsConfigMap);
  if (!resultsData) {
    return { error: null, success: false };
  }

  const { detailedDownloadUrl, detailedResultsFile, detailedResultsUrl } = resultsData;

  // Check health endpoint
  const healthCheckResult = await checkHealthEndpoint(detailedResultsUrl);
  if (healthCheckResult.isHealthy) {
    const downloadSuccess = await downloadResultsFile(detailedDownloadUrl, detailedResultsFile);
    if (!downloadSuccess) {
      return { error: getDefaultErrorMessage(t), success: false };
    }
    return { error: null, success: true };
  }

  // Certificate error detected - return certificate URL
  if (healthCheckResult.isCertificateError) {
    return {
      certificateUrl: healthCheckResult.healthUrl,
      error: t('It seems that your browser does not trust the certificate of the results server.'),
      success: false,
    };
  }

  // Health check failed (non-certificate error), remove stale data from configmap
  try {
    await kubevirtK8sPatch({
      cluster: getCluster(resultsConfigMap),
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

  return { error: null, success: false };
};

/**
 * Creates a results resources job and waits for the results ConfigMap to be ready
 * @param validatedParams - Validated job parameters
 * @param resultsConfigMapName - Name of the results ConfigMap
 * @returns The ConfigMap with results data or null if timeout
 */
const createAndWaitForResults = async (
  validatedParams: ValidatedJobParameters,
  resultsConfigMapName: string,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  await createResultsResourcesJob(validatedParams);

  const configMap = await waitForDetailedResultsConfigMap(
    resultsConfigMapName,
    validatedParams.namespace,
    validatedParams.cluster,
    DEFAULT_DOWNLOAD_TIMEOUT_MS,
  );

  return configMap;
};

/**
 * Safely retrieves the results ConfigMap, handling 404 errors gracefully
 * @param resultsConfigMapName - Name of the ConfigMap to retrieve
 * @param namespace - Namespace of the ConfigMap
 * @returns The ConfigMap if found, null if 404, or throws error for other failures
 */
const getResultsConfigMap = async (
  resultsConfigMapName: string,
  namespace: string,
  cluster: string,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  try {
    return await kubevirtK8sGet({
      cluster,
      model: ConfigMapModel,
      name: resultsConfigMapName,
      ns: namespace,
    });
  } catch (e: any) {
    // Treat NotFound (404) as "no existing results" and fall back to creating resources;
    // handle other errors by throwing.
    const status = e?.response?.status ?? e?.status;
    if (status && status !== 404) {
      kubevirtConsole.error('Failed to read results ConfigMap:', e);
      throw new Error(e);
    }
    // 404 or no status - treat as missing ConfigMap, continue to create resources
    return null;
  }
};

/**
 * Validates job timestamp and returns ConfigMap name (without setters)
 * @param job - The job to validate
 * @param t - Translation function
 * @returns Object with ConfigMap name if valid, or error message
 */
const validateJobAndGetConfigMapName = (
  job: IoK8sApiBatchV1Job,
): { configMapName: string } | { error: boolean } => {
  const timestamp = validateJobTimestamp(job);
  if (!timestamp) {
    kubevirtConsole.error(`Could not extract timestamp from job: ${job}`);
    return { error: true };
  }
  return { configMapName: getResultsConfigMapName(job.metadata.name) };
};

/**
 * Validates and extracts all required parameters from a job (without setters)
 * @param job - The job to extract parameters from
 * @param t - Translation function
 * @returns Validated job parameters or error message
 */
const validateJobParametersForResults = (
  job: IoK8sApiBatchV1Job,
): { error: boolean } | ValidatedJobParameters => {
  const cluster = getCluster(job);

  const namespace = job?.metadata?.namespace;
  if (!namespace) {
    kubevirtConsole.error(`Job namespace is required: ${job}`);
    return { error: true };
  }

  // Extract timestamp from original job
  const timestamp = validateJobTimestamp(job);
  if (!timestamp) {
    kubevirtConsole.error(`Could not extract timestamp from original job: ${job}`);
    return { error: true };
  }

  // Extract all parameters from original job
  const checkupImage = getCheckupImageFromJob(job);
  if (!checkupImage) {
    kubevirtConsole.error(`Could not extract checkup image from original job: ${job}`);
    return { error: true };
  }

  const testSuites = getTestSuitesFromJob(job);
  if (!testSuites || testSuites.length === 0) {
    kubevirtConsole.error(`Could not extract test suites from original job: ${job}`);
    return { error: true };
  }

  const isDryRun = getDryRunFromJob(job);
  const storageClass = getStorageClassFromJob(job);
  const testSkips = getTestSkipsFromJob(job);
  const storageCapabilities = getStorageCapabilitiesFromJob(job);

  // Extract PVC name from original job (to reuse it)
  const pvcName = getPVCNameFromJob(job);
  if (!pvcName) {
    kubevirtConsole.error(`Could not extract PVC name from original job: ${job}`);
    return { error: true };
  }

  // Extract base name from original job's CONFIGMAP_NAME env var
  // CONFIGMAP_NAME format: <jobName>-results
  const configMapNameEnv = job.spec?.template?.spec?.containers?.[0]?.env?.find(
    (env) => env.name === CONFIGMAP_NAME,
  );
  const resultsConfigMapName = configMapNameEnv?.value;
  if (!resultsConfigMapName) {
    kubevirtConsole.error(`Could not extract results configmap name from original job: ${job}`);
    return { error: true };
  }

  // Use the original job name with -results suffix
  const originalJobName = job.metadata.name;
  if (!originalJobName) {
    kubevirtConsole.error(`Could not extract job name from original job: ${job}`);
    return { error: true };
  }
  const resultsJobName = `${originalJobName}-results`;

  // Extract base name: remove "-results" suffix and the random number
  // Format: <baseName>-<number>-results -> <baseName>
  const baseName = extractConfigMapBaseName(resultsConfigMapName);

  return {
    baseName,
    checkupImage,
    cluster,
    isDryRun,
    namespace,
    originalJobName,
    pvcName,
    resultsConfigMapName,
    resultsJobName,
    storageCapabilities,
    storageClass,
    testSkips,
    testSuites,
    timestamp,
  };
};

export type DownloadResultsReturn = {
  error: { certificateUrl?: string; message: string } | null;
  success: boolean;
};

export type DownloadInputValidationResult =
  | { configMapName: string; valid: true }
  | { valid: false };

/**
 * Validates download inputs (job and namespace) and job structure
 * @param job - The job to validate (null if not available)
 * @param namespace - The namespace to validate (null if not available)
 * @param t - Translation function
 * @returns Validation result with configMapName if valid, or error message
 */
export const validateDownloadInputs = (
  job: IoK8sApiBatchV1Job | null,
  namespace: null | string,
): DownloadInputValidationResult => {
  // Validate inputs
  if (!job || !namespace) {
    kubevirtConsole.error(
      `Job and namespace required to download results. Job: ${job}, Namespace: ${namespace}`,
    );
    return { valid: false };
  }

  // Validate job and get ConfigMap name
  const configMapNameResult = validateJobAndGetConfigMapName(job);
  if ('error' in configMapNameResult) {
    return { valid: false };
  }

  return { configMapName: configMapNameResult.configMapName, valid: true };
};

/**
 * Downloads results for a self-validation job
 * @param job - The job to download results for (must be validated before calling)
 * @param namespace - The namespace of the job (must be validated before calling)
 * @param t - Translation function
 * @returns Promise with success status and error (including certificateUrl if applicable)
 */
export const downloadResults = async (
  job: IoK8sApiBatchV1Job,
  namespace: string,
  configMapName: string,
  t: TFunction,
): Promise<DownloadResultsReturn> => {
  const errorMessage = getDefaultErrorMessage(t);

  try {
    // Try to get existing ConfigMap
    const resultsConfigMap = await getResultsConfigMap(configMapName, namespace, getCluster(job));

    // Process existing results if found
    if (resultsConfigMap) {
      const downloadResult = await tryDownloadExistingResults(resultsConfigMap, t);
      if (downloadResult.success) {
        return { error: null, success: true };
      }
      if (downloadResult.certificateUrl) {
        return {
          error: {
            certificateUrl: downloadResult.certificateUrl,
            message: downloadResult.error || t('Certificate error occurred.'),
          },
          success: false,
        };
      }
    }

    // Validate job parameters before creating new results job
    const validatedParamsResult = validateJobParametersForResults(job);
    if ('error' in validatedParamsResult) {
      return {
        error: { message: errorMessage },
        success: false,
      };
    }

    // No valid results found, create new job and wait for results
    const configMap = await createAndWaitForResults(validatedParamsResult, configMapName);

    if (configMap) {
      const downloadResult = await tryDownloadExistingResults(configMap, t);
      if (downloadResult.success) {
        return { error: null, success: true };
      }
      if (downloadResult.certificateUrl) {
        return {
          error: {
            certificateUrl: downloadResult.certificateUrl,
            message: downloadResult.error || t('Certificate error occurred.'),
          },
          success: false,
        };
      }
      // Download failed for other reasons
      return {
        error: { message: errorMessage },
        success: false,
      };
    }

    // Timeout waiting for results
    return {
      error: { message: errorMessage },
      success: false,
    };
  } catch (err) {
    kubevirtConsole.error('Failed to download results:', err);
    const errorMsg = err instanceof Error ? `${errorMessage} ${err.message}` : errorMessage;
    return {
      error: { message: errorMsg },
      success: false,
    };
  }
};
