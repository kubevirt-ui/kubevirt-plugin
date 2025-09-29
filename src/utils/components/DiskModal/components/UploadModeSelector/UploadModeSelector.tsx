import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { VolumeTypes } from '../../utils/types';

export type UploadMode = VolumeTypes.DATA_VOLUME | VolumeTypes.PERSISTENT_VOLUME_CLAIM;

export type UploadModeSelectorProps = {
  isDisabled?: boolean;
  onUploadModeChange: (mode: UploadMode) => void;
  uploadMode: UploadMode;
};

const UploadModeSelector: FC<UploadModeSelectorProps> = ({
  isDisabled = false,
  onUploadModeChange,
  uploadMode,
}) => {
  const { t } = useKubevirtTranslation();
  const { DATA_VOLUME, PERSISTENT_VOLUME_CLAIM } = VolumeTypes;

  return (
    <FormGroup fieldId="upload-mode" isInline label={t('Upload mode')}>
      <Radio
        description={t('Use the DataVolume directly for the CD-ROM')}
        id="datavolume-mode"
        isChecked={uploadMode === DATA_VOLUME}
        isDisabled={isDisabled}
        label={t('Mount uploaded ISO as DataVolume')}
        name="upload-mode"
        onChange={() => onUploadModeChange(DATA_VOLUME)}
      />
      <Radio
        description={t('Use the PVC created by the DataVolume for the CD-ROM')}
        id="pvc-mode"
        isChecked={uploadMode === PERSISTENT_VOLUME_CLAIM}
        isDisabled={isDisabled}
        label={t('Mount uploaded ISO as PVC')}
        name="upload-mode"
        onChange={() => onUploadModeChange(PERSISTENT_VOLUME_CLAIM)}
      />
    </FormGroup>
  );
};

export default UploadModeSelector;
