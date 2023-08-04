import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ModalVariant } from '@patternfly/react-core';

import BootableVolumeList from '../../BootableVolumeList';

type BootableVolumeListModalProps = {
  bootableVolumesData: UseBootableVolumesValues;
  isOpen: boolean;
  onClose: () => void;
  preferencesData: V1beta1VirtualMachineClusterPreference[];
};

const BootableVolumeListModal: FC<BootableVolumeListModalProps> = ({
  isOpen,
  onClose,
  ...restProps
}) => {
  const { t } = useKubevirtTranslation();

  const { instanceTypeVMState, onSelectCreatedVolume } = useInstanceTypeVMStore();
  const { pvcSource, selectedBootableVolume } = instanceTypeVMState;
  const selectedBootableVolumeState = useState<BootableVolume>(selectedBootableVolume);

  const onSave = () => {
    onSelectCreatedVolume(selectedBootableVolumeState[0], pvcSource);
    onClose();
  };
  return (
    <TabModal
      headerText={t('Available volumes')}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      onClose={onClose}
      onSubmit={onSave as () => Promise<void>}
      submitBtnText={t('Select')}
    >
      <BootableVolumeList
        selectedBootableVolumeState={selectedBootableVolumeState}
        {...restProps}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
