import React, { FC, useState } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
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
  volumeNamespaceState: [volumeNamespace, setVolumeNamespace],
}) => {
  const { t } = useKubevirtTranslation();
  const [modalBootableVolumeSelected, setModalBootableVolumeSelected] =
    useState<BootableVolume>(bvSelected);
  const [modalVolumeNamespace, setModalVolumeNamespace] = useState(volumeNamespace);

  const onSave = () => {
    setBVSelected(modalBootableVolumeSelected);
    setVolumeNamespace(modalVolumeNamespace);
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
        volumeNamespaceState={[modalVolumeNamespace, setModalVolumeNamespace]}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
