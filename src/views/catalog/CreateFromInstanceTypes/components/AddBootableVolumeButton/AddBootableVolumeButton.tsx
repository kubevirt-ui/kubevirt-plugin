import React, { FC, useEffect, useState } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';

import AddBootableVolumeModal from '../AddBootableVolumeModal/AddBootableVolumeModal';

export type AddBootableVolumeButtonProps = {
  preferencesNames: string[];
  loadError?: any;
  buttonVariant?: ButtonVariant;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  loadError,
  buttonVariant,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    isEmpty(preferences) &&
      setPreferences((prevPreferences) => {
        prevPreferences.push(...preferencesNames);
        return prevPreferences;
      });
  }, [preferences, preferencesNames]);

  return (
    <Button
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <AddBootableVolumeModal
            isOpen={isOpen}
            onClose={onClose}
            preferencesNames={preferences}
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
