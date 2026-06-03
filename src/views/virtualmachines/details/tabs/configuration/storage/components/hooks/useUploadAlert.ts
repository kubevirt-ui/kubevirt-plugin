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
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getUploadAlertConfig, UploadAlertConfig } from '../../utils/constants';

type UseUploadAlertResult = {
  alertConfig: null | UploadAlertConfig;
  dismissAlert: () => void;
  onUploadStarted: (uploadPromise: Promise<unknown>, cdromDiskName?: string) => void;
  uploadError: string;
  uploadErrorHref?: string;
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
  const { t } = useKubevirtTranslation();
  const vmKey = getVmUploadKeyFromVm(vm);

  const uploads = useMountIsoUploadStore((state) => state.uploads);
  const setUpload = useMountIsoUploadStore((state) => state.setUpload);
  const getUpload = useMountIsoUploadStore((state) => state.getUpload);
  const clearUpload = useMountIsoUploadStore((state) => state.clearUpload);
  const clearCancelUpload = useMountIsoUploadStore((state) => state.clearCancelUpload);

  const vmUploads = useMemo(() => getUploadEntriesForVm(uploads, vmKey), [uploads, vmKey]);

  const uploadStatus = pickVmAlertStatus(vmUploads);
  const errorUpload = vmUploads.find(
    ([, upload]) => !upload.alertDismissed && upload.status === UPLOAD_ALERT_STATUS.ERROR,
  )?.[1];
  const uploadError = errorUpload?.errorMessage ?? '';
  const uploadErrorHref = errorUpload?.errorHref;

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

          const errorWithHref = err as { href?: string; message?: string };
          const errorMessage =
            (err instanceof Error ? err.message : errorWithHref?.message) || String(err);
          const errorHref = errorWithHref?.href;

          setUpload(uploadKey, {
            cdromDiskName: getUpload(uploadKey)?.cdromDiskName ?? diskName,
            errorHref,
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

  const alertConfig = uploadStatus ? getUploadAlertConfig(t)[uploadStatus] : null;

  return { alertConfig, dismissAlert, onUploadStarted, uploadError, uploadErrorHref };
};
