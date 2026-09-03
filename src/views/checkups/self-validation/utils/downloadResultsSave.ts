// Extracted from downloadResults.ts
// Root: src/views/checkups/self-validation/utils/downloadResults.ts

import axios from 'axios';
import { saveAs } from 'file-saver';
import { type TFunction } from 'i18next';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { SELF_VALIDATION_RESULTS_FILE_KEY, SELF_VALIDATION_RESULTS_URL_KEY } from './constants';
import { getDefaultErrorMessage, getDetailedResultsData } from './downloadResultsParse';
import { checkHealthEndpoint } from './downloadResultsPoll';

export type TryDownloadResult = {
  certificateUrl?: string;
  error: null | string;
  success: boolean;
};

export const downloadResultsFile = async (url: string, filename: string): Promise<boolean> => {
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

export const tryDownloadExistingResults = async (
  resultsConfigMap: IoK8sApiCoreV1ConfigMap,
  t: TFunction,
): Promise<TryDownloadResult> => {
  const resultsData = getDetailedResultsData(resultsConfigMap);
  if (!resultsData) {
    return { error: null, success: false };
  }

  const { detailedDownloadUrl, detailedResultsFile, detailedResultsUrl } = resultsData;

  const healthCheckResult = await checkHealthEndpoint(detailedResultsUrl);
  if (healthCheckResult.isHealthy) {
    const downloadSuccess = await downloadResultsFile(detailedDownloadUrl, detailedResultsFile);
    if (!downloadSuccess) {
      return { error: getDefaultErrorMessage(t), success: false };
    }
    return { error: null, success: true };
  }

  if (healthCheckResult.isCertificateError) {
    return {
      certificateUrl: healthCheckResult.healthUrl,
      error: t('It seems that your browser does not trust the certificate of the results server.'),
      success: false,
    };
  }

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
  }

  return { error: null, success: false };
};
