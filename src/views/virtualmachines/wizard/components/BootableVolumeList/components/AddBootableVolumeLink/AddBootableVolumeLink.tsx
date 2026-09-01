import React, { type FC } from 'react';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import './AddBootableVolumeLink.scss';

type AddBootableVolumeLinkProps = {
  canCreate: boolean;
  hidePopover?: () => void;
  loadError?: Error;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  text?: string;
};

const AddBootableVolumeLink: FC<AddBootableVolumeLinkProps> = ({
  canCreate,
  hidePopover,
  loadError,
  lockedPreference,
  onCreateVolume,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isDisabled = Boolean(loadError) || !canCreate;

  const openAddBootableVolumeModal = (): void => {
    if (isDisabled) {
      return;
    }

    hidePopover?.();
    createModal((props) => (
      <AddBootableVolumeModal
        {...props}
        lockedPreference={lockedPreference}
        onClose={props.onClose}
        onCreateVolume={onCreateVolume}
      />
    ));
  };

  const addVolumeButton = (
    <Button
      className="add-bootable-volume-link__inline-text"
      isAriaDisabled={isDisabled}
      isInline
      onClick={openAddBootableVolumeModal}
      variant={ButtonVariant.link}
    >
      {text ?? t('Add volume')}
    </Button>
  );

  if (!isDisabled) {
    return addVolumeButton;
  }

  return (
    <Tooltip
      content={
        loadError
          ? t('Could not load data required to add a volume')
          : t("You don't have permission to create boot sources")
      }
      trigger="mouseenter focus"
    >
      {addVolumeButton}
    </Tooltip>
  );
};

export default AddBootableVolumeLink;
