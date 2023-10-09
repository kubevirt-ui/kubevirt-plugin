import React, { FC } from 'react';
import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

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

  const sourceNamespace = getOSImagesNS();

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(sourceNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const { onSelectCreatedVolume } = useInstanceTypeVMStore();

  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <AddBootableVolumeModal
            enforceNamespace={sourceNamespace}
            onCreateVolume={onSelectCreatedVolume}
            {...props}
          />
        ))
      }
      isDisabled={!!loadError || !canCreate}
      variant={ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
