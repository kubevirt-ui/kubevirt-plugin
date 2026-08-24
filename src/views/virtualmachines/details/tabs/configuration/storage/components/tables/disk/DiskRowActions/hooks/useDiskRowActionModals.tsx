import React from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant } from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { type UseDiskRowActionModals } from '../types';

import CreateBootableVolumeModal from '../../../../modal/CreateBootableVolumeModal';
import DeleteDiskModal from '../../../../modal/DeleteDiskModal';
import DetachModal from '../../../../modal/DetachModal';
import EjectCDROMModal from '../../../../modal/EjectCDROMModal';
import MakePersistentModal from '../../../../modal/MakePersistentModal';
import MountCDROMModal from '../../../../modal/MountCDROMModal';
import { isPVCSource } from '../../utils/helpers';
import { customizeDeleteDisk } from '../utils/customizeDeleteDisk';

export const useDiskRowActionModals: UseDiskRowActionModals = ({
  cancelUpload,
  closeDropdown,
  customize = false,
  diskName,
  diskSource,
  isCDROM,
  isCDROMMountedState,
  isHotplug,
  obj,
  onDiskUpdate,
  vm,
  vmi,
  volume,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const deleteBtnText = t('Detach');

  const onCustomizeDeleteDisk = async (): Promise<V1VirtualMachine> =>
    customizeDeleteDisk({
      cancelUpload,
      diskName,
      isCDROM,
      onDiskUpdate,
      vm,
    });

  const createEditDiskModal = (): void =>
    createModal(({ isOpen, onClose }) => (
      <DiskModal
        createdPVCName={isPVCSource(obj) ? obj?.source : null}
        editDiskName={diskName}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onDiskUpdate ?? updateDisks}
        vm={vm}
      />
    ));

  const createDeleteDiskModal = (): void =>
    createModal(({ isOpen, onClose }) =>
      customize || isCDROM ? (
        <DetachModal
          diskName={diskName}
          headerText={t('Detach disk?')}
          isOpen={isOpen}
          obj={vm}
          onClose={onClose}
          onSubmit={onCustomizeDeleteDisk}
          submitBtnText={deleteBtnText}
          submitBtnVariant={ButtonVariant.danger}
        />
      ) : (
        <DeleteDiskModal
          isHotPluginVolume={isHotplug}
          isOpen={isOpen}
          onClose={onClose}
          vm={vm}
          volume={volume}
        />
      ),
    );

  const createBootableVolume = (): void => {
    createModal(({ isOpen, onClose }) => (
      <CreateBootableVolumeModal diskObj={obj} isOpen={isOpen} onClose={onClose} vm={vm} />
    ));
  };

  const makePersistent = (): void =>
    createModal(({ isOpen, onClose }) => (
      <MakePersistentModal isOpen={isOpen} onClose={onClose} vm={vm} vmi={vmi} volume={volume} />
    ));

  const createCDROMModal = (): void => {
    const Component = isCDROMMountedState ? EjectCDROMModal : MountCDROMModal;
    return createModal(({ isOpen, onClose }) => (
      <Component
        cdromName={diskName}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onDiskUpdate ?? updateDisks}
        vm={vm}
        {...(isCDROMMountedState && { source: diskSource })}
      />
    ));
  };

  const onModalOpen = (createModalCallback: () => void): void => {
    createModalCallback();
    closeDropdown();
  };

  return {
    createBootableVolume,
    createCDROMModal,
    createDeleteDiskModal,
    createEditDiskModal,
    makePersistent,
    onModalOpen,
  };
};
