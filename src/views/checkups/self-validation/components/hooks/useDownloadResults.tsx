import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  downloadResults,
  getDefaultErrorMessage,
  validateDownloadInputs,
} from '../../utils/downloadResults';
import DownloadResultsErrorModal from '../DownloadResultsErrorModal';

export const useDownloadResults = (): {
  download: (job: IoK8sApiBatchV1Job, namespace: null | string) => Promise<void>;
  isDownloading: boolean;
} => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const download = useCallback(
    async (job: IoK8sApiBatchV1Job, namespace: null | string) => {
      // Validate inputs before async operation
      const validation = validateDownloadInputs(job, namespace);
      if (validation.valid === false) {
        if (isMountedRef.current) {
          createModal((props) => (
            <DownloadResultsErrorModal {...props} errorMessage={getDefaultErrorMessage(t)} />
          ));
        }
        return;
      }

      setIsDownloading(true);
      try {
        const result = await downloadResults(job, namespace, validation.configMapName, t);
        if (!result.success && result.error && isMountedRef.current) {
          createModal((props) => (
            <DownloadResultsErrorModal
              {...props}
              errorMessage={result.error.message || getDefaultErrorMessage(t)}
              url={result.error.certificateUrl}
            />
          ));
        }
      } catch (error) {
        kubevirtConsole.error('Failed to download results:', error);
        if (isMountedRef.current) {
          createModal((props) => (
            <DownloadResultsErrorModal {...props} errorMessage={getDefaultErrorMessage(t)} />
          ));
        }
      } finally {
        if (isMountedRef.current) {
          setIsDownloading(false);
        }
      }
    },
    [createModal, t],
  );

  return { download, isDownloading };
};
