import { useCallback, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCdromUploadKeyFromVm,
  getUploadEntriesForVm,
  getVmUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  UploadAlertStatus,
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

const pickVmAlertStatus = (
  vmUploads: [string, { alertDismissed?: boolean; status: UploadAlertStatus }][],
): null | UploadAlertStatus => {
  const visible = vmUploads.filter(([, upload]) => !upload.alertDismissed);
  if (visible.some(([, upload]) => upload.status === UPLOAD_ALERT_STATUS.UPLOADING)) {
    return UPLOAD_ALERT_STATUS.UPLOADING;
  }
  if (visible.some(([, upload]) => upload.status === UPLOAD_ALERT_STATUS.ERROR)) {
    return UPLOAD_ALERT_STATUS.ERROR;
  }
  if (visible.some(([, upload]) => upload.status === UPLOAD_ALERT_STATUS.SUCCESS)) {
    return UPLOAD_ALERT_STATUS.SUCCESS;
  }
  return null;
};

export const useUploadAlert = (vm: V1VirtualMachine): UseUploadAlertResult => {
  const vmKey = getVmUploadKeyFromVm(vm);

  const uploads = useMountIsoUploadStore((state) => state.uploads);
  const setUpload = useMountIsoUploadStore((state) => state.setUpload);
  const getUpload = useMountIsoUploadStore((state) => state.getUpload);
  const clearUpload = useMountIsoUploadStore((state) => state.clearUpload);
  const clearCancelUpload = useMountIsoUploadStore((state) => state.clearCancelUpload);

  const vmUploads = useMemo(() => getUploadEntriesForVm(uploads, vmKey), [uploads, vmKey]);

  const uploadStatus = pickVmAlertStatus(vmUploads);
  const uploadError =
    vmUploads.find(
      ([, upload]) => !upload.alertDismissed && upload.status === UPLOAD_ALERT_STATUS.ERROR,
    )?.[1]?.errorMessage ?? '';

  const onUploadStarted = useCallback(
    (uploadPromise: Promise<unknown>, cdromDiskName?: string): void => {
      const diskName = cdromDiskName ?? '';
      const uploadKey = getCdromUploadKeyFromVm(vm, diskName);

      setUpload(uploadKey, {
        cdromDiskName: diskName,
        status: UPLOAD_ALERT_STATUS.UPLOADING,
      });

      uploadPromise
        .then(() => {
          setUpload(uploadKey, {
            cdromDiskName: getUpload(uploadKey)?.cdromDiskName ?? diskName,
            status: UPLOAD_ALERT_STATUS.SUCCESS,
          });
          clearCancelUpload(uploadKey);
        })
        .catch((err: unknown) => {
          if (isUploadCanceledError(err)) {
            clearUpload(uploadKey);
            clearCancelUpload(uploadKey);
            return;
          }

          const errorMessage =
            (err instanceof Error ? err.message : (err as { message?: string })?.message) ||
            String(err);

          setUpload(uploadKey, {
            cdromDiskName: getUpload(uploadKey)?.cdromDiskName ?? diskName,
            errorMessage,
            status: UPLOAD_ALERT_STATUS.ERROR,
          });
          clearCancelUpload(uploadKey);
        });
    },
    [clearCancelUpload, clearUpload, getUpload, setUpload, vm],
  );

  const dismissAlert = useCallback((): void => {
    vmUploads.forEach(([uploadKey, upload]) => {
      if (upload.status === UPLOAD_ALERT_STATUS.UPLOADING) {
        setUpload(uploadKey, { ...upload, alertDismissed: true });
      } else {
        clearUpload(uploadKey);
        clearCancelUpload(uploadKey);
      }
    });
  }, [clearCancelUpload, clearUpload, setUpload, vmUploads]);

  const alertConfig = uploadStatus ? uploadAlertConfig[uploadStatus] : null;

  return { alertConfig, dismissAlert, onUploadStarted, uploadError };
};
