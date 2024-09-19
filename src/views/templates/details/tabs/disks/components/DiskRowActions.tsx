import React, { FC, useCallback, useState } from 'react';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

type DiskRowActionsProps = {
  diskName: string;
  isDisabled?: boolean;
  onUpdate: (updatedVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const DiskRowActions: FC<DiskRowActionsProps> = ({ diskName, isDisabled, onUpdate, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteBtnText = t('Detach');

  const onDelete = useCallback(() => {
    const vmWithDeletedDisk = produceVMDisks(vm, (draftVM) => {
      const volumeToDelete = draftVM.spec.template.spec.volumes.find(
        (volume) => volume.name === diskName,
      );

      if (volumeToDelete?.dataVolume?.name) {
        draftVM.spec.dataVolumeTemplates = draftVM.spec.dataVolumeTemplates.filter(
          (dataVolume) => dataVolume.metadata.name !== volumeToDelete.dataVolume.name,
        );
      }

      draftVM.spec.template.spec.volumes = draftVM.spec.template.spec.volumes.filter(
        (volume) => volume.name !== diskName,
      );
      draftVM.spec.template.spec.domain.devices.disks =
        draftVM.spec.template.spec.domain.devices.disks.filter((disk) => disk.name !== diskName);
    });

    return onUpdate(vmWithDeletedDisk);
  }, [diskName, onUpdate, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        headerText={t('Detach disk?')}
        isOpen={isOpen}
        obj={vm}
        onClose={onClose}
        onSubmit={onDelete}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage action="detach" obj={{ metadata: { name: diskName } }} />
      </TabModal>
    ));
  };

  const onEditModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <DiskModal
        editDiskName={diskName}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onUpdate}
        vm={vm}
      />
    ));
  };

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({ id: 'toggle-id-disk', isDisabled, onClick: onToggle })}
    >
      <DropdownList>
        <DropdownItem key="disk-edit" onClick={onEditModalToggle}>
          {t('Edit')}
        </DropdownItem>
        <DropdownItem key="disk-delete" onClick={onDeleteModalToggle}>
          {deleteBtnText}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default DiskRowActions;
