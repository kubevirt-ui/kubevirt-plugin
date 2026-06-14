import { useState } from 'react';

import {
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import {
  AddBootableVolumeState,
  UseAddBootableVolumeModalData,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

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

  const { checkUploadReady, upload, uploadData } = useCDIUpload(selectedCluster);

  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
  );

  return {
    bootableVolume,
    checkUploadReady,
    setBootableVolume,
    setSourceType,
    sourceType,
    upload,
    uploadData,
  };
};

export default useAddBootableVolumeModalData;
