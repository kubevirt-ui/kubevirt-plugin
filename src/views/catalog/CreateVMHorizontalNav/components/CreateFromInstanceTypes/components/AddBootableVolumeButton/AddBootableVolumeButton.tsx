import React, { FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

import AddBootableVolumeModal from './components/AddBootableVolumeModal/AddBootableVolumeModal';

export type AddBootableVolumeButtonProps = {
  preferencesNames: string[];
  instanceTypesNames: string[];
  loaded: boolean;
  loadError?: any;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  instanceTypesNames,
  loaded,
  loadError,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <Button
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <AddBootableVolumeModal
            isOpen={isOpen}
            onClose={onClose}
            preferencesNames={preferencesNames}
            instanceTypesNames={instanceTypesNames}
          />
        ))
      }
      variant={ButtonVariant.secondary}
      isLoading={!loaded}
      isDisabled={!loaded || loadError}
    >
      {t('Add bootable Volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
