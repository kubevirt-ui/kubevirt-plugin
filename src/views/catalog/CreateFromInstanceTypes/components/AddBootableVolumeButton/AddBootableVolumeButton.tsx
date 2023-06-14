import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';

export type AddBootableVolumeButtonProps = {
  buttonVariant?: ButtonVariant;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({ buttonVariant }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const sourceNamespace = isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(sourceNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const { instanceTypesAndPreferencesData, onSelectCreatedVolume } = useInstanceTypeVMStore();
  const { loadError } = instanceTypesAndPreferencesData;

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
      isDisabled={loadError || !canCreate}
      variant={buttonVariant || ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
