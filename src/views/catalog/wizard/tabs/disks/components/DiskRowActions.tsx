import * as React from 'react';
import { Trans } from 'react-i18next';

import { ensurePath, produceVMDisks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
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

    // check if disk has data volume created and tries to delete it (mainly for upload data volumes)
    const volume = getVolumes(vm)?.find((vol) => vol.name === diskName && !!vol?.dataVolume);

    if (volume) {
      return k8sDelete({
        model: DataVolumeModel,
        resource: {
          metadata: { name: volume?.dataVolume?.name, namespace: vm?.metadata?.namespace },
        },
      })
        .catch(console.error)
        .finally(() => updateVM(vmWithDeletedDisk)) as Promise<V1VirtualMachine>;
    }

    return updateVM(vmWithDeletedDisk);
  }, [diskName, updateVM, vm]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        onClose={onClose}
        isOpen={isOpen}
        obj={vm}
        onSubmit={onDelete}
        headerText={t('Detach {{diskName}} disk', { diskName })}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <Trans t={t}>
          Are you sure you want to detach <strong>{diskName} </strong>
        </Trans>
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
