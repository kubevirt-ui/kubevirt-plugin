import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { initialAccessModes } from '@kubevirt-utils/components/DiskModal/components/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';

import UploadPVCFormAccessMode from './UploadPVCFormAccessMode';
import UploadPVCFormModeVolumeMode from './UploadPVCFormVolumeMode';

type UploadPVCFormModeProps = {
  accessMode: string | undefined;
  applySP: boolean;
  setAccessMode: Dispatch<SetStateAction<string>>;
  setVolumeMode: Dispatch<SetStateAction<string>>;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassName: string;
  volumeMode: string | undefined;
};

const UploadPVCFormMode: FC<UploadPVCFormModeProps> = ({
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
    storageClasses?.find((storageClass) => getName(storageClass) === storageClassName)
      ?.provisioner ?? '';
  return applySP ? (
    <div>
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
