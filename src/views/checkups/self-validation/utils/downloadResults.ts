import { type TFunction } from 'i18next';

import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import { validateJobParametersForResults } from './downloadResultsJobParams';
import { getDefaultErrorMessage } from './downloadResultsParse';
import { createAndWaitForResults, getResultsConfigMap } from './downloadResultsPoll';
import { tryDownloadExistingResults } from './downloadResultsSave';

export type DownloadResultsReturn = {
  error: { certificateUrl?: string; message: string } | null;
  success: boolean;
};

const certificateFailure = (
  certificateUrl: string,
  message: null | string,
  t: TFunction,
): DownloadResultsReturn => ({
  error: {
    certificateUrl,
    message: message ?? t('Certificate error occurred.'),
  },
  success: false,
});

export const downloadResults = async (
  job: IoK8sApiBatchV1Job,
  namespace: string,
  configMapName: string,
  t: TFunction,
): Promise<DownloadResultsReturn> => {
  const errorMessage = getDefaultErrorMessage(t);

  try {
    const resultsConfigMap = await getResultsConfigMap(configMapName, namespace, getCluster(job));

    if (resultsConfigMap) {
      const downloadResult = await tryDownloadExistingResults(resultsConfigMap, t);
      if (downloadResult.success) {
        return { error: null, success: true };
      }
      if (downloadResult.certificateUrl) {
        return certificateFailure(downloadResult.certificateUrl, downloadResult.error, t);
      }
    }

    const validatedParamsResult = validateJobParametersForResults(job);
    if ('error' in validatedParamsResult) {
      return {
        error: { message: errorMessage },
        success: false,
      };
    }

    const configMap = await createAndWaitForResults(validatedParamsResult, configMapName);

    if (configMap) {
      const downloadResult = await tryDownloadExistingResults(configMap, t);
      if (downloadResult.success) {
        return { error: null, success: true };
      }
      if (downloadResult.certificateUrl) {
        return certificateFailure(downloadResult.certificateUrl, downloadResult.error, t);
      }
      return {
        error: { message: errorMessage },
        success: false,
      };
    }

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

export type { DownloadInputValidationResult } from './downloadResultsParse';
export { getDefaultErrorMessage, validateDownloadInputs } from './downloadResultsParse';
