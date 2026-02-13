import React, { FC } from 'react';

import HTTPSource from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeSource/components/HTTPSource';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  SetBootableVolumeFieldType,
} from '../../utils/constants';

import DiskSourceUploadPVC from './components/DiskSourceUploadPVC';
import PVCSource from './components/PVCSource';
import RegistrySource from './components/RegistrySource';
import SnapshotSource from './components/SnapshotSource';

type VolumeSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
};

const VolumeSource: FC<VolumeSourceProps> = ({
  bootableVolume,
  setBootableVolumeField,
  sourceType,
  upload,
}) => {
  const { t } = useKubevirtTranslation();
  const { uploadFile, uploadFilename } = bootableVolume || {};

  const sourceComponentByType = {
    [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: (
      <DiskSourceUploadPVC
        isIso={bootableVolume.isIso}
        label={t('Upload PVC image')}
        relevantUpload={upload}
        setIsIso={setBootableVolumeField('isIso')}
        setUploadFile={setBootableVolumeField('uploadFile')}
        setUploadFileName={setBootableVolumeField('uploadFilename')}
        uploadFile={uploadFile}
        uploadFileName={uploadFilename}
      />
    ),
    [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: (
      <PVCSource bootableVolume={bootableVolume} setBootableVolumeField={setBootableVolumeField} />
    ),
    [DROPDOWN_FORM_SELECTION.USE_HTTP]: (
      <HTTPSource bootableVolume={bootableVolume} setBootableVolumeField={setBootableVolumeField} />
    ),
    [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: (
      <RegistrySource
        bootableVolume={bootableVolume}
        setBootableVolumeField={setBootableVolumeField}
      />
    ),
    [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: (
      <SnapshotSource
        bootableVolume={bootableVolume}
        setBootableVolumeField={setBootableVolumeField}
      />
    ),
  };

  return sourceComponentByType[sourceType];
};

export default VolumeSource;
