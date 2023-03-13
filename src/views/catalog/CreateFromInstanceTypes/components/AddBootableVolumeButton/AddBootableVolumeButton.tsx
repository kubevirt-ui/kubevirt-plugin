import React, { FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

import AddBootableVolumeModal from '../AddBootableVolumeModal/AddBootableVolumeModal';

export type AddBootableVolumeButtonProps = {
  preferencesNames: string[];
  instanceTypesNames: string[];
  loadError?: any;
  buttonVariant?: ButtonVariant;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  instanceTypesNames,
  loadError,
  buttonVariant,
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
      variant={buttonVariant || ButtonVariant.secondary}
      isDisabled={loadError}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
