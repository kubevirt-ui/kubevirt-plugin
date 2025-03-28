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
    <div data-test="sp-default-settings">
      {t('Access mode: {{accessMode}} / Volume mode: {{volumeMode}}', {
        accessMode,
        volumeMode,
      })}
    </div>
  ) : (
    <>
      <UploadPVCFormAccessMode
        availableAccessModes={initialAccessModes}
        initialAccessMode={storageClassName ? accessMode : undefined}
        loaded
        onChange={(aMode) => setAccessMode(aMode)}
        provisioner={provisioner}
      />
      <UploadPVCFormModeVolumeMode
        accessMode={accessMode}
        loaded
        onChange={(vMode) => setVolumeMode(vMode)}
        provisioner={provisioner}
        storageClass={storageClassName}
        volumeMode={storageClassName ? volumeMode : undefined}
      />
    </>
  );
};

export default UploadPVCFormMode;
