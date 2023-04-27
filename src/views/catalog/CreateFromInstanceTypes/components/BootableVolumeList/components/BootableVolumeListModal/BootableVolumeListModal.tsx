import React, { FC, useState } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/constants';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ModalVariant } from '@patternfly/react-core';

import BootableVolumeList from '../../BootableVolumeList';
import { ShowAllBootableVolumesButtonProps } from '../ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';

type BootableVolumeListModalProps = {
  isOpen: boolean;
  onClose: () => void;
} & ShowAllBootableVolumesButtonProps;

const BootableVolumeListModal: FC<BootableVolumeListModalProps> = ({
  isOpen,
  onClose,
  preferences,
  bootableVolumeSelectedState: [bvSelected, setBVSelected],
  bootableVolumesResources,
}) => {
  const { t } = useKubevirtTranslation();
  const [modalBootableVolumeSelected, setModalBootableVolumeSelected] =
    useState<BootableVolume>(bvSelected);

  const onSave = () => {
    setBVSelected(modalBootableVolumeSelected);
    onClose();
  };
  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSave as () => Promise<void>}
      headerText={t('Available volumes')}
      modalVariant={ModalVariant.large}
    >
      <BootableVolumeList
        preferences={preferences}
        bootableVolumeSelectedState={[modalBootableVolumeSelected, setModalBootableVolumeSelected]}
        bootableVolumesResources={bootableVolumesResources}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
