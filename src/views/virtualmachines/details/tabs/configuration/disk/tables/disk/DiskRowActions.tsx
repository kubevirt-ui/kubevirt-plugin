import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import DeleteDiskModal from '../../modal/DeleteDiskModal';
import MakePersistentModal from '../../modal/MakePersistentModal';

import { getEditDiskStates } from './utils/getEditDiskStates';
import { isHotplugVolume } from './utils/helpers';

type DiskRowActionsProps = {
  vm: V1VirtualMachine;
  diskName: string;
  pvcResourceExists: boolean;
  vmi?: V1VirtualMachineInstance;
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({
  vm,
  diskName,
  pvcResourceExists,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const isVMRunning = vm?.status?.printableStatus !== printableVMStatus.Stopped;
  const isHotplug = isHotplugVolume(vm, diskName, vmi);
  const isEditDisabled = isVMRunning || pvcResourceExists;

  const { initialDiskState, initialDiskSourceState } =
    !isEditDisabled && getEditDiskStates(vm, diskName, vmi);
  const volumes = isVMRunning ? vmi?.spec?.volumes : getVolumes(vm);
  const volume = volumes?.find(({ name }) => name === diskName);

  const editBtnText = t('Edit');
  const deleteBtnText = t('Detach');
  const removeHotplugBtnText = t('Make Persistent');

  const disabledEditText = React.useMemo(() => {
    if (isVMRunning) {
      return t('Can edit only when VirtualMachine is stopped');
    }
    if (pvcResourceExists) {
      return t('Cannot edit resources that already created');
    }
    return null;
  }, [isVMRunning, pvcResourceExists, t]);

  const onSubmit = (updatedVM) =>
    k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM?.metadata?.namespace,
      name: updatedVM?.metadata?.name,
    });

  const createEditDiskModal = () =>
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Edit disk')}
        onSubmit={onSubmit}
        initialDiskState={initialDiskState}
        initialDiskSourceState={initialDiskSourceState}
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
      onClick={() => onModalOpen(createEditDiskModal)}
      key="disk-edit"
      isDisabled={isEditDisabled}
      description={disabledEditText}
    >
      {editBtnText}
    </DropdownItem>,
    <DropdownItem
      onClick={() => onModalOpen(createDeleteDiskModal)}
      key="disk-delete"
      isDisabled={!isHotplug && isVMRunning}
      description={
        !isHotplug && isVMRunning
          ? t('Can detach only hotplug volumes while VirtualMachine is Running')
          : null
      }
    >
      {deleteBtnText}
    </DropdownItem>,
  ];

  if (isHotplug) {
    items.push(
      <DropdownItem
        onClick={() => onModalOpen(makePersistent)}
        key="make-persistent"
        description={t('Will make disk persistent on next reboot')}
      >
        {removeHotplugBtnText}
      </DropdownItem>,
    );
  }
  return (
    <>
      <Dropdown
        menuAppendTo={getContentScrollableElement}
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-6" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={items}
        position={DropdownPosition.right}
      />
    </>
  );
};

export default DiskRowActions;
