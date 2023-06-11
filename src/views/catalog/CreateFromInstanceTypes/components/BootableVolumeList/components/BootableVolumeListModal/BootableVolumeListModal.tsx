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

  const { instanceTypeVMState, onSelectCreatedVolume } = useInstanceTypeVMStore();
  const { selectedBootableVolume } = instanceTypeVMState;
  const selectedBootableVolumeState = useState<BootableVolume>(selectedBootableVolume);

  const onSave = () => {
    onSelectCreatedVolume(selectedBootableVolumeState[0]);
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
      <BootableVolumeList selectedBootableVolumeState={selectedBootableVolumeState} />
    </TabModal>
  );
};

export default BootableVolumeListModal;
