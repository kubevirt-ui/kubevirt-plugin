import React from 'react';

import { initialAccessModes } from '@kubevirt-utils/components/DiskModal/components/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import UploadPVCFormAccessMode from './UploadPVCFormAccessMode';
import UploadPVCFormModeVolumeMode from './UploadPVCFormVolumeMode';

const UploadPVCFormMode = ({
  accessMode,
  applySP,
  setAccessMode,
  setVolumeMode,
  storageClasses,
  storageClassName,
  volumeMode,
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
          availableAccessModes={initialAccessModes}
          initialAccessMode={storageClassName ? accessMode : undefined}
          loaded
          onChange={(aMode) => setAccessMode(aMode)}
          provisioner={provisioner}
        />
      </div>
      <div className="form-group">
        <UploadPVCFormModeVolumeMode
          accessMode={accessMode}
          loaded
          onChange={(vMode) => setVolumeMode(vMode)}
          provisioner={provisioner}
          storageClass={storageClassName}
          volumeMode={storageClassName ? volumeMode : undefined}
        />
      </div>
    </div>
  );
};

export default UploadPVCFormMode;
