import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ModalVariant } from '@patternfly/react-core';

import BootableVolumeList from '../../BootableVolumeList';

type BootableVolumeListModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BootableVolumeListModal: FC<BootableVolumeListModalProps> = ({ isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();

  const { onSelectVolume, instanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedBootableVolume } = instanceTypeVMState;
  const selectedBootableVolumeState = useState<BootableVolume>(selectedBootableVolume);

  const onSave = () => {
    onSelectVolume(selectedBootableVolumeState[0]);
    onClose();
  };
  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSave as () => Promise<void>}
      headerText={t('Available volumes')}
      modalVariant={ModalVariant.large}
      submitBtnText={t('Select')}
    >
      <BootableVolumeList selectedBootableVolumeState={selectedBootableVolumeState} />
    </TabModal>
  );
};

export default BootableVolumeListModal;
