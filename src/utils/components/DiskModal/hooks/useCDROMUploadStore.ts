import { useEffect } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getVmUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useSyncMountIsoUploadEnded } from '@virtualmachines/details/tabs/configuration/storage/components/hooks/useSyncMountIsoUploadEnded';

type UseCDROMUploadStoreParams = {
  isUploading: boolean;
  markBackgroundUploadEnded: () => void;
  upload: DataUpload;
  vm: V1VirtualMachine;
};

type UseCDROMUploadStoreResult = {
  clearCancelUpload: (key: string) => void;
  clearPersistedUpload: (key: string) => void;
  isUploadActive: boolean;
  vmUploadKey: string;
};

export const useCDROMUploadStore = ({
  isUploading,
  markBackgroundUploadEnded,
  upload,
  vm,
}: UseCDROMUploadStoreParams): UseCDROMUploadStoreResult => {
  const vmUploadKey = getVmUploadKeyFromVm(vm);

  const persistedUploadStatus = useMountIsoUploadStore(
    (state) => state.uploads[vmUploadKey]?.status,
  );
  const clearPersistedUpload = useMountIsoUploadStore((state) => state.clearUpload);
  const setCancelUpload = useMountIsoUploadStore((state) => state.setCancelUpload);
  const clearCancelUpload = useMountIsoUploadStore((state) => state.clearCancelUpload);

  const isUploadActive = isUploading || persistedUploadStatus === UPLOAD_ALERT_STATUS.UPLOADING;

  useSyncMountIsoUploadEnded(vmUploadKey, markBackgroundUploadEnded);

  useEffect(() => {
    if (upload?.cancelUpload) {
      setCancelUpload(vmUploadKey, upload.cancelUpload);
    }
  }, [setCancelUpload, upload?.cancelUpload, vmUploadKey]);

  return {
    clearCancelUpload,
    clearPersistedUpload,
    isUploadActive,
    vmUploadKey,
  };
};
