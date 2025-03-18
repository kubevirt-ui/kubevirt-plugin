import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ModalVariant } from '@patternfly/react-core';

import BootableVolumeList from '../../BootableVolumeList';

type BootableVolumeListModalProps = {
  bootableVolumesData: UseBootableVolumesValues;
  favorites: UserSettingFavorites;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedBootableVolume: BootableVolume) => void;
  preferencesData: V1beta1VirtualMachineClusterPreference[];
};

const BootableVolumeListModal: FC<BootableVolumeListModalProps> = ({
  favorites,
  isOpen,
  onClose,
  onSelect,
  ...restProps
}) => {
  const { t } = useKubevirtTranslation();

  const { instanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedBootableVolume } = instanceTypeVMState;
  const selectedBootableVolumeState = useState<BootableVolume>(selectedBootableVolume);

  const onSave = () => {
    onSelect(selectedBootableVolumeState[0]);
    onClose();

    return Promise.resolve();
  };

  return (
    <TabModal
      headerText={t('Available volumes')}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      onClose={onClose}
      onSubmit={onSave}
      submitBtnText={t('Select')}
    >
      <BootableVolumeList
        favorites={favorites}
        selectedBootableVolumeState={selectedBootableVolumeState}
        {...restProps}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
