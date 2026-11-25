import { type FC } from 'react';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import AddBootableVolumeWizard from '@kubevirt-utils/components/AddBootableVolumeWizard/AddBootableVolumeWizard';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import { getCreateBootSourcesPermissionDeniedMessage } from '../../utils/utils';

import './AddBootableVolumeLink.scss';

type AddBootableVolumeLinkProps = {
  canCreate: boolean;
  cluster?: string;
  hidePopover?: () => void;
  loadError?: Error;
  lockedPreference?: PreferenceOption;
  namespace?: string;
  onCreateVolume: (volume: BootableVolume) => void;
  onUploadStart?: (uploadKey: string) => void;
  text?: string;
};

const AddBootableVolumeLink: FC<AddBootableVolumeLinkProps> = ({
  canCreate,
  cluster,
  hidePopover,
  loadError,
  lockedPreference,
  namespace,
  onCreateVolume,
  onUploadStart,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isDisabled = Boolean(loadError) || !canCreate;

  const openAddBootableVolumeWizard = (): void => {
    if (isDisabled) {
      return;
    }

    hidePopover?.();
    createModal(({ onClose }) => (
      <AddBootableVolumeWizard
        initialValues={{ cluster, lockedPreference, namespace }}
        onClose={onClose}
        onCreateVolume={onCreateVolume}
        onUploadStart={onUploadStart}
      />
    ));
  };

  const addVolumeButton = (
    <Button
      className="add-bootable-volume-link__inline-text"
      isAriaDisabled={isDisabled}
      isInline
      onClick={openAddBootableVolumeWizard}
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
          : getCreateBootSourcesPermissionDeniedMessage(t)
      }
      trigger="mouseenter focus"
    >
      {addVolumeButton}
    </Tooltip>
  );
};

export default AddBootableVolumeLink;
