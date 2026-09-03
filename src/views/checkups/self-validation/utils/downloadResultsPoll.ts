// Extracted from downloadResults.ts
// Root: src/views/checkups/self-validation/utils/downloadResults.ts

import axios, { isAxiosError } from 'axios';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import {
  DEFAULT_DOWNLOAD_TIMEOUT_MS,
  DEFAULT_POLL_INTERVAL_MS,
  type ValidatedJobParameters,
} from './constants';
import { getDetailedResultsData } from './downloadResultsParse';
import { createResultsResourcesJob } from './selfValidationJob/resultsResources';

type K8sErrorStatus = {
  response?: { status?: number };
  status?: number;
};

const getK8sErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const k8sError = error as K8sErrorStatus;
  return k8sError.response?.status ?? k8sError.status;
};

export type HealthCheckResult = {
  healthUrl: string;
  isCertificateError: boolean;
  isHealthy: boolean;
};

export const checkHealthEndpoint = async (url: string): Promise<HealthCheckResult> => {
  const healthUrl = `${url}/health`;
  try {
    await axios.get(healthUrl);
    return { healthUrl, isCertificateError: false, isHealthy: true };
  } catch (catchError: unknown) {
    const isCertificateError = isAxiosError(catchError)
      ? catchError.response?.data === undefined
      : true;
    if (isCertificateError) {
      kubevirtConsole.warn('Health check failed due to invalid certificate:', healthUrl);
      return { healthUrl, isCertificateError: true, isHealthy: false };
    }
    kubevirtConsole.warn('Health check failed:', catchError);
    return { healthUrl, isCertificateError: false, isHealthy: false };
  }
};

export const waitForDetailedResultsConfigMap = async (
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

export const getResultsConfigMap = async (
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
  } catch (e: unknown) {
    const status = getK8sErrorStatus(e);
    if (status !== undefined && status !== 404) {
      kubevirtConsole.error('Failed to read results ConfigMap:', e);
      throw e instanceof Error ? e : new Error(String(e));
    }
    return null;
  }
};

export const createAndWaitForResults = async (
  validatedParams: ValidatedJobParameters,
  resultsConfigMapName: string,
): Promise<IoK8sApiCoreV1ConfigMap | null> => {
  await createResultsResourcesJob(validatedParams);

  return waitForDetailedResultsConfigMap(
    resultsConfigMapName,
    validatedParams.namespace,
    validatedParams.cluster,
    DEFAULT_DOWNLOAD_TIMEOUT_MS,
  );
};
