import { Dispatch, SetStateAction, useState } from 'react';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import {
  DataUpload,
  UploadDataProps,
  useCDIUpload,
} from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseAddBootableVolumeModalData = (lockedPreference?: PreferenceOption) => {
  bootableVolume: AddBootableVolumeState;
  setBootableVolume: Dispatch<SetStateAction<AddBootableVolumeState>>;
  setSourceType: Dispatch<SetStateAction<DROPDOWN_FORM_SELECTION>>;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
};

const useAddBootableVolumeModalData: UseAddBootableVolumeModalData = (lockedPreference) => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  const selectedCluster = useSelectedCluster();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>({
    ...initialBootableVolumeState,
    bootableVolumeCluster: selectedCluster,
    bootableVolumeNamespace: namespace,
    labels: lockedPreference
      ? {
          ...initialBootableVolumeState.labels,
          [DEFAULT_PREFERENCE_KIND_LABEL]: lockedPreference.kind,
          [DEFAULT_PREFERENCE_LABEL]: lockedPreference.name,
        }
      : { ...initialBootableVolumeState.labels },
    lockedPreference: lockedPreference?.name,
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
