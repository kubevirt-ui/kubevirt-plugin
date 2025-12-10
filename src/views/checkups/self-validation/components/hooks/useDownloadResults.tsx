import { useCallback, useState } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  downloadResults,
  DownloadResultsReturn,
  getDefaultErrorMessage,
  validateDownloadInputs,
} from '../../utils/downloadResults';

export const useDownloadResults = (): {
  download: (
    job: IoK8sApiBatchV1Job,
    namespace: null | string,
  ) => Promise<DownloadResultsReturn | null>;
  isDownloading: boolean;
} => {
  const { t } = useKubevirtTranslation();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const download = useCallback(
    async (
      job: IoK8sApiBatchV1Job,
      namespace: null | string,
    ): Promise<DownloadResultsReturn | null> => {
      // Validate inputs before async operation
      const validation = validateDownloadInputs(job, namespace);
      if (validation.valid === false) {
        return {
          error: { message: getDefaultErrorMessage(t) },
          success: false,
        };
      }

      setIsDownloading(true);
      try {
        const result = await downloadResults(job, namespace, validation.configMapName, t);
        return result;
      } catch (error) {
        kubevirtConsole.error('Failed to download results:', error);
        return {
          error: { message: getDefaultErrorMessage(t) },
          success: false,
        };
      } finally {
        setIsDownloading(false);
      }
    },
    [t],
  );

  return { download, isDownloading };
};
