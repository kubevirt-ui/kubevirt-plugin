import React, { FC, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
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
}) => {
  const { t } = useKubevirtTranslation();
  const [modalBootableVolumeSelected, setModalBootableVolumeSelected] =
    useState<V1beta1DataSource>(bvSelected);

  const onSave = () => {
    setBVSelected(modalBootableVolumeSelected);
    onClose();
  };
  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSave as () => Promise<void>}
      headerText={t('Volumes to boot from')}
      modalVariant={ModalVariant.large}
    >
      <BootableVolumeList
        preferences={preferences}
        bootableVolumeSelectedState={[modalBootableVolumeSelected, setModalBootableVolumeSelected]}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
