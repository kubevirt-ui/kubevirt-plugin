import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import BootableVolumeList from '@virtualmachines/wizard/components/BootableVolumeList/BootableVolumeList';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';
import ChangeBootSourceModalFooter from './components/ChangeBootSourceModalFooter';
import useChangeBootSourceModal from './hooks/useChangeBootSourceModal';
import { CHANGE_BOOT_SOURCE_TITLE_ID } from './utils/consts';
import { type ChangeBootSourceModalProps } from './utils/types';

const ChangeBootSourceModal: FC<ChangeBootSourceModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const { t } = useKubevirtTranslation();

  const {
    bootableVolumesData,
    canCreate,
    cluster,
    instanceTypesAndPreferencesData,
    lockedPreference,
    onConfirm,
    onCreateVolume,
    onSelectBootableVolume,
    preferenceName,
    selectedBootableVolume,
    setVolumeListNamespace,
    volumeListNamespace,
  } = useChangeBootSourceModal(props);

  return (
    <Modal
      aria-labelledby={CHANGE_BOOT_SOURCE_TITLE_ID}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <ModalHeader labelId={CHANGE_BOOT_SOURCE_TITLE_ID} title={t('Change boot source')} />
      <ModalBody>
        <AddBootableVolumeButton
          canCreate={canCreate}
          lockedPreference={lockedPreference}
          onCreateVolume={onCreateVolume}
        />
        <BootableVolumeList
          bootableVolumesData={bootableVolumesData}
          canCreateVolume={canCreate}
          cluster={cluster}
          instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
          loadError={instanceTypesAndPreferencesData?.loadError}
          lockedPreference={lockedPreference}
          onCreateVolume={onCreateVolume}
          onSelectBootableVolume={onSelectBootableVolume}
          onVolumeListNamespaceChange={setVolumeListNamespace}
          preferenceName={preferenceName}
          selectedBootableVolume={selectedBootableVolume}
          showNoBootSourceHint={false}
          syncFiltersWithURL={false}
          volumeListNamespace={volumeListNamespace}
        />
      </ModalBody>
      <ChangeBootSourceModalFooter
        hasSelection={Boolean(selectedBootableVolume)}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
};

export default ChangeBootSourceModal;
