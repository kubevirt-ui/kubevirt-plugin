import { useEffect } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCdromUploadKeyFromVm,
  UPLOAD_ALERT_STATUS,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useSyncMountIsoUploadEnded } from '@virtualmachines/details/tabs/configuration/storage/components/hooks/useSyncMountIsoUploadEnded';

type UseCDROMUploadStoreParams = {
  cdromDiskName: string;
  isUploading: boolean;
  markBackgroundUploadEnded: () => void;
  upload: DataUpload;
  vm: V1VirtualMachine;
};

type UseCDROMUploadStoreResult = {
  cdromUploadKey: string;
  clearCancelUpload: (key: string) => void;
  clearPersistedUpload: (key: string) => void;
  isUploadActive: boolean;
};

export const useCDROMUploadStore = ({
  cdromDiskName,
  isUploading,
  markBackgroundUploadEnded,
  upload,
  vm,
}: UseCDROMUploadStoreParams): UseCDROMUploadStoreResult => {
  const cdromUploadKey = getCdromUploadKeyFromVm(vm, cdromDiskName);

  const persistedUpload = useMountIsoUploadStore((state) => state.uploads[cdromUploadKey]);
  const clearPersistedUpload = useMountIsoUploadStore((state) => state.clearUpload);
  const setCancelUpload = useMountIsoUploadStore((state) => state.setCancelUpload);
  const clearCancelUpload = useMountIsoUploadStore((state) => state.clearCancelUpload);

  const isUploadActive = isUploading || persistedUpload?.status === UPLOAD_ALERT_STATUS.UPLOADING;

  useSyncMountIsoUploadEnded(cdromUploadKey, markBackgroundUploadEnded);

  useEffect(() => {
    if (upload?.cancelUpload) {
      setCancelUpload(cdromUploadKey, upload.cancelUpload);
    }
  }, [cdromUploadKey, setCancelUpload, upload?.cancelUpload]);

  return {
    cdromUploadKey,
    clearCancelUpload,
    clearPersistedUpload,
    isUploadActive,
  };
};
