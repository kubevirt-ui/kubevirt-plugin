import * as React from 'react';

import { ensurePath, produceVMDisks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
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
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ diskName }) => {
  const { t } = useKubevirtTranslation();
  const { vm, updateVM, tabsData, updateTabsData } = useWizardVMContext();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteBtnText = t('Detach');

  const { initialDiskState, initialDiskSourceState } = useEditDiskStates(vm, diskName);

  const onDelete = React.useCallback(() => {
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
        .catch(console.error)
        .finally(() => updateVM(vmWithDeletedDisk)) as Promise<V1VirtualMachine>;
    }

    return updateVM(vmWithDeletedDisk);
  }, [diskName, tabsData?.disks?.dataVolumesToAddOwnerRef, updateVM, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        onClose={onClose}
        isOpen={isOpen}
        obj={vm}
        onSubmit={onDelete}
        headerText={t('Detach disk?')}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage
          obj={{ metadata: { name: diskName, namespace: vm?.metadata?.namespace } }}
          action="detach"
        />
      </TabModal>
    ));
  };

  const onEditModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <EditDiskModal
        vm={vm}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Edit disk')}
        onSubmit={updateVM}
        initialDiskState={initialDiskState}
        initialDiskSourceState={initialDiskSourceState}
        createOwnerReference={false}
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
      />
    ));
  };

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      onSelect={() => setIsDropdownOpen(false)}
      toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" />}
      isOpen={isDropdownOpen}
      isPlain
      dropdownItems={[
        <DropdownItem onClick={onEditModalToggle} key="disk-edit">
          {t('Edit')}
        </DropdownItem>,
        <DropdownItem onClick={onDeleteModalToggle} key="disk-delete">
          {deleteBtnText}
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default DiskRowActions;
