import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { Button, ButtonVariant } from '@patternfly/react-core';

export type AddBootableVolumeButtonProps = {
  loadError: Error;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({ loadError }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { onSelectCreatedVolume, volumeListNamespace } = useInstanceTypeVMStore();

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <AddBootableVolumeModal onCreateVolume={onSelectCreatedVolume} {...props} />
        ))
      }
      id="tour-step-add-volume"
      isDisabled={!!loadError || !canCreate}
      variant={ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
