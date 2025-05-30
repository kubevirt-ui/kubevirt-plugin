import React, { FC, useCallback, useState } from 'react';

import useRegistryCredentials from '@catalog/utils/useRegistryCredentials/useRegistryCredentials';
import { produceVMDisks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import {
  DefaultFormValues,
  V1DiskFormState,
} from '@kubevirt-utils/components/DiskModal/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath, isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

type DiskRowActionsProps = {
  diskName: string;
};

const DiskRowActions: FC<DiskRowActionsProps> = ({ diskName }) => {
  const { t } = useKubevirtTranslation();
  const { tabsData, updateTabsData, updateVM, vm } = useWizardVMContext();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { decodedRegistryCredentials, updateRegistryCredentials } = useRegistryCredentials();
  const defaultFormValues: DefaultFormValues = { registryCredentials: decodedRegistryCredentials };

  const deleteBtnText = t('Detach');

  const onDelete = useCallback(() => {
    const volumeToDelete = vm.spec.template.spec.volumes.find((volume) => volume.name === diskName);

    const vmWithDeletedDisk = produceVMDisks(vm, (draftVM) => {
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

    // check if disk has a created dataVolume that needs to be deleted (mainly for uploads)
    const dataVolumeToDelete = tabsData?.disks?.dataVolumesToAddOwnerRef?.find(
      (dv) => dv.metadata.name === volumeToDelete.persistentVolumeClaim.claimName,
    );

    if (dataVolumeToDelete) {
      return k8sDelete({
        model: DataVolumeModel,
        resource: dataVolumeToDelete,
      })
        .catch(kubevirtConsole.error)
        .finally(() => updateVM(vmWithDeletedDisk)) as Promise<V1VirtualMachine>;
    }

    return updateVM(vmWithDeletedDisk);
  }, [diskName, tabsData?.disks?.dataVolumesToAddOwnerRef, updateVM, vm]);

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

  const handleEditSubmit = (newVM: V1VirtualMachine, diskFormState: V1DiskFormState) => {
    const { registryCredentials } = diskFormState;
    !isEmpty(registryCredentials) && updateRegistryCredentials(registryCredentials);
    return updateVM(newVM);
  };

  const onEditModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <DiskModal
        onUploadedDataVolume={(dataVolume) =>
          updateTabsData((draft) => {
            ensurePath(draft, 'disks.dataVolumesToAddOwnerRef');
            if (draft.disks) {
              draft.disks.dataVolumesToAddOwnerRef = [
                ...(tabsData?.disks?.dataVolumesToAddOwnerRef || []),
                dataVolume,
              ];
            }
          })
        }
        defaultFormValues={defaultFormValues}
        editDiskName={diskName}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleEditSubmit}
        vm={vm}
      />
    ));
  };

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      toggle={KebabToggle({ id: 'toggle-id-disk', onClick: onToggle })}
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
