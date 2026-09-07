import React, { type FC } from 'react';

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
  const { canCreate, lockedPreference, onCreateVolume, onUploadStart } = useAddBootableVolume();

  const openAddBootableVolumeModal = (): void => {
    createModal((props) => (
      <AddBootableVolumeModal
        {...props}
        lockedPreference={lockedPreference}
        onClose={props.onClose}
        onCreateVolume={onCreateVolume}
        onUploadStart={onUploadStart}
      />
    ));
  };

  return (
    <Button
      className="add-bootable-volume-link__inline-text"
      isDisabled={!!loadError || !canCreate}
      isInline
      onClick={() => {
        hidePopover?.();
        openAddBootableVolumeModal();
      }}
      variant={ButtonVariant.link}
    >
      {text || t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeLink;
