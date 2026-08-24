/* eslint-disable max-lines */
import React, { type FC, useMemo, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import {
  isDeclarativeHotplugVolumesEnabled,
  produceVMDisks,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getDataVolumeName, isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Tooltip,
} from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { useMountIsoUploadForDisk } from '../../hooks/useMountIsoUploadForDisk';
import CreateBootableVolumeModal from '../../modal/CreateBootableVolumeModal';
import DeleteDiskModal from '../../modal/DeleteDiskModal';
import DetachModal from '../../modal/DetachModal';
import EjectCDROMModal from '../../modal/EjectCDROMModal';
import MakePersistentModal from '../../modal/MakePersistentModal';
import MountCDROMModal from '../../modal/MountCDROMModal';
import { type DiskRowActionsProps } from './types';
import { getDiskVolumeState } from './utils/getDiskVolumeState';
import { isHotplugVolume, isPVCSource } from './utils/helpers';

const DiskRowActions: FC<DiskRowActionsProps> = ({
  customize = false,
  obj,
  onDiskUpdate,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { name: diskName, source: diskSource } = obj || {};

  const isHotplug = isHotplugVolume(vm, diskName, vmi);

  const vmDisk = getDisks(vm)?.find((disk) => disk.name === diskName);
  const isCDROM = vmDisk ? isCDROMDisk(vmDisk) : false;
  const isDeclarativeHotplugVolumesFeatureGateEnabled = useMemo(
    () => isDeclarativeHotplugVolumesEnabled(featureGates),
    [featureGates],
  );

  const { isCDROMMountedState, volume } = useMemo(
    () => getDiskVolumeState(vm, vmi, diskName, isCDROM),
    [vm, vmi, diskName, isCDROM],
  );

  const isCDROMOperationsEnabled = isCDROM && isDeclarativeHotplugVolumesFeatureGateEnabled;
  const { cancelUpload, isUploadInProgress } = useMountIsoUploadForDisk(vm, diskName);

  const editBtnText = t('Edit');
  const mountIsoUploadInProgressTooltip = t('Upload in progress');
  const deleteBtnText = t('Detach');
  const removeHotplugBtnText = t('Make persistent');

  const onCustomizeDeleteDisk = async (): Promise<V1VirtualMachine> => {
    if (isCDROM) {
      await cancelUpload();
    }

    const newVM = produceVMDisks(vm, (draftVM) => {
      const volumeToDelete = getVolumes(draftVM)?.find((vol) => vol.name === diskName);
      const volumeName = volumeToDelete?.name ?? diskName;
      draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM)?.filter(
        (disk) => disk.name !== volumeName,
      );
      draftVM.spec.template.spec.volumes = getVolumes(draftVM)?.filter(
        (vol) => vol.name !== volumeName,
      );
      draftVM.spec.dataVolumeTemplates = getDataVolumeTemplates(draftVM)?.filter(
        (dataVolume) => getName(dataVolume) !== getDataVolumeName(volumeToDelete),
      );
    });

    return (onDiskUpdate ?? updateDisks)(newVM);
  };

  const createEditDiskModal = (): void =>
    createModal(({ isOpen, onClose }) => (
      <DiskModal
        createdPVCName={isPVCSource(obj) && obj?.hasPVC ? obj?.source : null}
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
    setIsDropdownOpen(false);
  };

  const onToggle = (): void => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  const handleCancelMountIsoUpload = async (): Promise<void> => {
    setIsDropdownOpen(false);
    await cancelUpload();
  };

  const actionLabel = isCDROMMountedState ? t('Eject') : t('Mount');
  const cdromDropdownItem = (
    <DropdownItem
      isDisabled={isUploadInProgress}
      key="cdrom"
      onClick={isUploadInProgress ? undefined : (): void => onModalOpen(createCDROMModal)}
    >
      {actionLabel}
    </DropdownItem>
  );
  const mountCdromItem = isUploadInProgress ? (
    <Tooltip content={mountIsoUploadInProgressTooltip}>
      <span>{cdromDropdownItem}</span>
    </Tooltip>
  ) : (
    cdromDropdownItem
  );

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({
        id: `disk-actions-${diskName}`,
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
    >
      <DropdownList>
        <DropdownItem
          isDisabled={!isPVCSource(obj)}
          key="disk-bootable-volume"
          onClick={() => createBootableVolume()}
        >
          {t('Save as bootable volume')}
        </DropdownItem>
        <DropdownItem key="disk-edit" onClick={() => onModalOpen(createEditDiskModal)}>
          {editBtnText}
        </DropdownItem>
        {isCDROMOperationsEnabled && mountCdromItem}
        {isCDROMOperationsEnabled && isUploadInProgress && (
          <DropdownItem key="cdrom-cancel-upload" onClick={handleCancelMountIsoUpload}>
            {getCancelUploadLabel(t)}
          </DropdownItem>
        )}
        <DropdownItem key="disk-delete" onClick={() => onModalOpen(createDeleteDiskModal)}>
          {deleteBtnText}
        </DropdownItem>
        {isHotplug && !isCDROM && (
          <DropdownItem
            description={t('Will make disk persistent on next reboot')}
            key="make-persistent"
            onClick={() => onModalOpen(makePersistent)}
          >
            {removeHotplugBtnText}
          </DropdownItem>
        )}
      </DropdownList>
    </Dropdown>
  );
};

export default DiskRowActions;
