import * as React from 'react';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import { useEditDiskStates } from '../hooks/useEditDiskState';

type DiskRowActionsProps = {
  diskName: string;
  isDisabled?: boolean;
  onUpdate: (updatedVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ diskName, isDisabled, onUpdate, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteBtnText = t('Detach');

  const { initialDiskSourceState, initialDiskState } = useEditDiskStates(vm, diskName);

  const onDelete = React.useCallback(() => {
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
        <ConfirmActionMessage
          action="detach"
          obj={{ metadata: { name: diskName, namespace: vm?.metadata?.namespace } }}
        />
      </TabModal>
    ));
  };

  const onEditModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        createOwnerReference={false}
        headerText={t('Edit disk')}
        initialDiskSourceState={initialDiskSourceState}
        initialDiskState={initialDiskState}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onUpdate}
        vm={vm}
      />
    ));
  };

  return (
    <Dropdown
      dropdownItems={[
        <DropdownItem key="disk-edit" onClick={onEditModalToggle}>
          {t('Edit')}
        </DropdownItem>,
        <DropdownItem key="disk-delete" onClick={onDeleteModalToggle}>
          {deleteBtnText}
        </DropdownItem>,
      ]}
      toggle={
        <KebabToggle id="toggle-id-disk" isDisabled={isDisabled} onToggle={setIsDropdownOpen} />
      }
      isOpen={isDropdownOpen}
      isPlain
      menuAppendTo={getContentScrollableElement}
      onSelect={() => setIsDropdownOpen(false)}
      position={DropdownPosition.right}
    />
  );
};

export default DiskRowActions;
