import { Dispatch, SetStateAction, useState } from 'react';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import {
  DataUpload,
  UploadDataProps,
  useCDIUpload,
} from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseAddBootableVolumeModalData = () => {
  bootableVolume: AddBootableVolumeState;
  setBootableVolume: Dispatch<SetStateAction<AddBootableVolumeState>>;
  setSourceType: Dispatch<SetStateAction<DROPDOWN_FORM_SELECTION>>;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
};

const useAddBootableVolumeModalData: UseAddBootableVolumeModalData = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  const selectedCluster = useSelectedCluster();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>({
    ...initialBootableVolumeState,
    bootableVolumeCluster: selectedCluster,
    bootableVolumeNamespace: namespace,
  });

  const { upload, uploadData } = useCDIUpload(selectedCluster);

  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
  );

  return {
    bootableVolume,
    setBootableVolume,
    setSourceType,
    sourceType,
    upload,
    uploadData,
  };
};

export default useAddBootableVolumeModalData;
