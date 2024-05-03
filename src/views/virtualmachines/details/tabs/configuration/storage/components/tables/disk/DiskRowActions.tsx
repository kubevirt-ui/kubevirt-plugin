import React, { FC, useMemo, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';
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
  const isEditDisabled = isVMRunning;

  const initialFormState = !isEditDisabled && getEditDiskStates(vm, diskName, vmi);
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

  const createEditDiskModal = () =>
    createModal(({ isOpen, onClose }) => (
      <DiskModal
        headerText={t('Edit disk')}
        initialFormData={initialFormState}
        isEditingCreatedDisk={pvcResourceExists}
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

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({ id: 'toggle-id-6', isExpanded: isDropdownOpen, onClick: onToggle })}
    >
      <DropdownList>
        <DropdownItem
          description={disabledEditText}
          isDisabled={isEditDisabled}
          key="disk-edit"
          onClick={() => onModalOpen(createEditDiskModal)}
        >
          {editBtnText}
        </DropdownItem>
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
        </DropdownItem>
        {isHotplug && (
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
