import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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

  const isEnabled = runningTourSignal.value || (isEmpty(loadError) && canCreate);

  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <AddBootableVolumeModal onCreateVolume={onSelectCreatedVolume} {...props} />
        ))
      }
      id="tour-step-add-volume"
      isDisabled={!isEnabled}
      variant={ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
