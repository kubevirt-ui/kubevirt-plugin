import React, { FC } from 'react';

import useOnSelectCreatedVolume from '@catalog/CreateFromInstanceTypes/state/hooks/useOnSelectCreatedVolume';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { Button, ButtonVariant } from '@patternfly/react-core';

import './AddBootableVolumeLink.scss';

type AddBootableVolumeLinkProps = {
  hidePopover?: () => void;
  loadError: Error;
  text?: string;
};

const AddBootableVolumeLink: FC<AddBootableVolumeLinkProps> = ({
  hidePopover,
  loadError,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { volumeListNamespace } = useInstanceTypeVMStore();
  const onSelectCreatedVolume = useOnSelectCreatedVolume();

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  return (
    <Button
      onClick={() => {
        hidePopover?.();
        createModal((props) => (
          <AddBootableVolumeModal onCreateVolume={onSelectCreatedVolume} {...props} />
        ));
      }}
      className="add-bootable-volume-link__inline-text"
      data-test-id="add-volume-button-under-list"
      isDisabled={!!loadError || !canCreate}
      isInline
      variant={ButtonVariant.link}
    >
      {text || t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeLink;
