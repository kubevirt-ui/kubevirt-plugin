import React, { FC, useMemo, useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import DeleteDiskModal from '../../modal/DeleteDiskModal';
import MakePersistentModal from '../../modal/MakePersistentModal';

import { getEditDiskStates } from './utils/getEditDiskStates';
import { isHotplugVolume } from './utils/helpers';

type DiskRowActionsProps = {
  diskName: string;
  pvcResourceExists: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskRowActions: FC<DiskRowActionsProps> = ({ diskName, pvcResourceExists, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isVMRunning = isRunning(vm);
  const isHotplug = isHotplugVolume(vm, diskName, vmi);
  const isEditDisabled = isVMRunning;

  const { initialDiskSourceState, initialDiskState } =
    !isEditDisabled && getEditDiskStates(vm, diskName, vmi);
  const volumes = isVMRunning ? vmi?.spec?.volumes : getVolumes(vm);
  const volume = volumes?.find(({ name }) => name === diskName);

  const editBtnText = t('Edit');
  const deleteBtnText = t('Detach');
  const removeHotplugBtnText = t('Make persistent');

  const disabledEditText = useMemo(() => {
    if (isVMRunning) {
      return t('Can edit only when VirtualMachine is stopped');
    }
    return null;
  }, [isVMRunning, t]);

  const onSubmit = (updatedVM) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });

  const createEditDiskModal = () =>
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        headerText={t('Edit disk')}
        initialDiskSourceState={initialDiskSourceState}
        initialDiskState={initialDiskState}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        vm={vm}
      />
    ));

  const createDeleteDiskModal = () =>
    createModal(({ isOpen, onClose }) => (
      <DeleteDiskModal isOpen={isOpen} onClose={onClose} vm={vm} volume={volume} />
    ));
  const makePersistent = () =>
    createModal(({ isOpen, onClose }) => (
      <MakePersistentModal isOpen={isOpen} onClose={onClose} vm={vm} volume={volume} />
    ));

  const onModalOpen = (createModalCallback: () => void) => {
    createModalCallback();
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem
      description={disabledEditText}
      isDisabled={isEditDisabled}
      key="disk-edit"
      onClick={() => onModalOpen(createEditDiskModal)}
    >
      {editBtnText}
    </DropdownItem>,
    <DropdownItem
      description={
        !isHotplug && isVMRunning
          ? t('Can detach only hotplug volumes while VirtualMachine is Running')
          : null
      }
      isDisabled={!isHotplug && isVMRunning}
      key="disk-delete"
      onClick={() => onModalOpen(createDeleteDiskModal)}
    >
      {deleteBtnText}
    </DropdownItem>,
  ];

  if (isHotplug) {
    items.push(
      <DropdownItem
        description={t('Will make disk persistent on next reboot')}
        key="make-persistent"
        onClick={() => onModalOpen(makePersistent)}
      >
        {removeHotplugBtnText}
      </DropdownItem>,
    );
  }
  return (
    <Dropdown
      dropdownItems={items}
      isOpen={isDropdownOpen}
      isPlain
      menuAppendTo={getContentScrollableElement}
      onSelect={() => setIsDropdownOpen(false)}
      position={DropdownPosition.right}
      toggle={<KebabToggle id="toggle-id-6" onToggle={setIsDropdownOpen} />}
    />
  );
};

export default DiskRowActions;
