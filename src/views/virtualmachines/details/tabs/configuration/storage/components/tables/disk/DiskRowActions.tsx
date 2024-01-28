import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import DeleteDiskModal from '../../modal/DeleteDiskModal';
import MakePersistentModal from '../../modal/MakePersistentModal';

import { getEditDiskStates } from './utils/getEditDiskStates';
import { isHotplugVolume, isPVCSource, isPVCStatusBound } from './utils/helpers';

type DiskRowActionsProps = {
  obj: DiskRowDataLayout;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskRowActions: FC<DiskRowActionsProps> = ({ obj, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const diskName = obj?.name;
  const pvcResourceExists = isPVCSource(obj);
  const isPVCBound = isPVCStatusBound(obj);

  const isVMRunning = isRunning(vm);
  const isHotplug = isHotplugVolume(vm, diskName, vmi);
  const isEditDisabled = isVMRunning || pvcResourceExists;

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
    if (pvcResourceExists) {
      return t('Cannot edit resources that already created');
    }
    return null;
  }, [isVMRunning, pvcResourceExists, t]);

  const createEditDiskModal = () =>
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        headerText={t('Edit disk')}
        initialDiskSourceState={initialDiskSourceState}
        initialDiskState={initialDiskState}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateDisks}
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
      isDisabled={(!isHotplug && isVMRunning) || (pvcResourceExists && !isPVCBound)}
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
