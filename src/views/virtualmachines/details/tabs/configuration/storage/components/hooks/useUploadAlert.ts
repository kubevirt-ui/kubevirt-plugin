import { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getVmUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';

import { UploadAlertConfig, uploadAlertConfig } from '../../utils/constants';

type UseUploadAlertResult = {
  alertConfig: null | UploadAlertConfig;
  dismissAlert: () => void;
  onUploadStarted: (uploadPromise: Promise<unknown>, cdromDiskName?: string) => void;
  uploadError: string;
};

export const useUploadAlert = (vm: V1VirtualMachine): UseUploadAlertResult => {
  const vmKey = getVmUploadKeyFromVm(vm);

  const persistedUpload = useMountIsoUploadStore((state) => state.uploads[vmKey]);
  const setUpload = useMountIsoUploadStore((state) => state.setUpload);
  const getUpload = useMountIsoUploadStore((state) => state.getUpload);
  const clearUpload = useMountIsoUploadStore((state) => state.clearUpload);
  const clearCancelUpload = useMountIsoUploadStore((state) => state.clearCancelUpload);

  const uploadStatus = persistedUpload?.status ?? null;
  const uploadError = persistedUpload?.errorMessage ?? '';

  const onUploadStarted = useCallback(
    (uploadPromise: Promise<unknown>, cdromDiskName?: string): void => {
      setUpload(vmKey, {
        cdromDiskName: cdromDiskName ?? '',
        status: UPLOAD_ALERT_STATUS.UPLOADING,
      });

      uploadPromise
        .then(() => {
          setUpload(vmKey, {
            cdromDiskName: getUpload(vmKey)?.cdromDiskName,
            status: UPLOAD_ALERT_STATUS.SUCCESS,
          });
          clearCancelUpload(vmKey);
        })
        .catch((err: unknown) => {
          if (isUploadCanceledError(err)) {
            clearUpload(vmKey);
            clearCancelUpload(vmKey);
            return;
          }

          const errorMessage =
            (err instanceof Error ? err.message : (err as { message?: string })?.message) ||
            String(err);

          setUpload(vmKey, {
            cdromDiskName: getUpload(vmKey)?.cdromDiskName,
            errorMessage,
            status: UPLOAD_ALERT_STATUS.ERROR,
          });
          clearCancelUpload(vmKey);
        });
    },
    [clearCancelUpload, clearUpload, getUpload, setUpload, vmKey],
  );

  const dismissAlert = useCallback((): void => {
    const current = getUpload(vmKey);
    if (!current || current.status !== UPLOAD_ALERT_STATUS.UPLOADING) {
      clearUpload(vmKey);
      clearCancelUpload(vmKey);
      return;
    }
    setUpload(vmKey, { ...current, alertDismissed: true });
  }, [clearCancelUpload, clearUpload, getUpload, setUpload, vmKey]);

  const isAlertDismissed = persistedUpload?.alertDismissed ?? false;
  const alertConfig = uploadStatus && !isAlertDismissed ? uploadAlertConfig[uploadStatus] : null;

  return { alertConfig, dismissAlert, onUploadStarted, uploadError };
};
