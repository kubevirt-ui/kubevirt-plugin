import React, { FC } from 'react';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import useAddBootableVolume from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/hooks/useAddBootableVolume';

import './AddBootableVolumeLink.scss';

type AddBootableVolumeLinkProps = {
  hidePopover?: () => void;
  loadError?: Error;
  text?: string;
};

const AddBootableVolumeLink: FC<AddBootableVolumeLinkProps> = ({
  hidePopover,
  loadError,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { canCreate, lockedPreference, onCreateVolume } = useAddBootableVolume();

  const openAddBootableVolumeModal = () => {
    createModal((props) => (
      <AddBootableVolumeModal
        {...props}
        lockedPreference={lockedPreference}
        onClose={props.onClose}
        onCreateVolume={onCreateVolume}
      />
    ));
  };

  return (
    <Button
      onClick={() => {
        hidePopover?.();
        openAddBootableVolumeModal();
      }}
      className="add-bootable-volume-link__inline-text"
      isDisabled={!!loadError || !canCreate}
      isInline
      variant={ButtonVariant.link}
    >
      {text || t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeLink;
