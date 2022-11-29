import React from 'react';

import { initialAccessModes } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import UploadPVCFormAccessMode from './UploadPVCFormAccessMode';
import UploadPVCFormModeVolumeMode from './UploadPVCFormVolumeMode';

const UploadPVCFormMode = ({
  applySP,
  accessMode,
  volumeMode,
  setVolumeMode,
  setAccessMode,
  storageClasses,
  storageClassName,
}) => {
  const { t } = useKubevirtTranslation();
  const provisioner =
    storageClasses?.find((sc) => sc.metadata.name === storageClassName)?.provisioner || '';
  return applySP ? (
    <div className="form-group" data-test="sp-default-settings">
      {t('Access mode: {{accessMode}} / Volume mode: {{volumeMode}}', {
        accessMode,
        volumeMode,
      })}
    </div>
  ) : (
    <div data-test="sp-no-default-settings">
      <div className="form-group">
        <UploadPVCFormAccessMode
          onChange={(aMode) => setAccessMode(aMode)}
          provisioner={provisioner}
          loaded
          availableAccessModes={initialAccessModes}
          initialAccessMode={storageClassName ? accessMode : undefined}
        />
      </div>
      <div className="form-group">
        <UploadPVCFormModeVolumeMode
          onChange={(vMode) => setVolumeMode(vMode)}
          provisioner={provisioner}
          accessMode={accessMode}
          storageClass={storageClassName}
          loaded
          volumeMode={storageClassName ? volumeMode : undefined}
        />
      </div>
    </div>
  );
};

export default UploadPVCFormMode;
