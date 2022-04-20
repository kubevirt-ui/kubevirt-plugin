import * as React from 'react';
import { Trans } from 'react-i18next';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1DataVolumeTemplateSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
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
  vm: V1VirtualMachine;
  onUpdate: (updatedVM: V1VirtualMachine) => Promise<void>;
  isDisabled?: boolean;
};

const getDiskDataVolume = (
  vm: V1VirtualMachine,
  diskName: string,
): V1DataVolumeTemplateSpec | undefined => {
  const disk = getDisks(vm)?.find((d) => d.name === diskName);

  if (!disk) return;

  const volume = getVolumes(vm)?.find((v) => v.name === diskName);

  if (!volume || !volume.dataVolume) return;

  return getDataVolumeTemplates(vm)?.find(
    (dataVolume) => dataVolume.metadata?.name === volume.dataVolume.name,
  );
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ diskName, vm, onUpdate, isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteBtnText = t('Delete');

  const { initialDiskState, initialDiskSourceState } = useEditDiskStates(vm, diskName);
  const diskDataVolume = getDiskDataVolume(vm, diskName);
  /** TODO: add editing support for sourceRef in 4.12 */
  const hasSourceRef = !!diskDataVolume?.spec?.sourceRef;

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
        onClose={onClose}
        isOpen={isOpen}
        obj={vm}
        onSubmit={onDelete}
        headerText={t('Delete {{diskName}} disk', { diskName })}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <Trans t={t}>
          Are you sure you want to delete <strong>{diskName} </strong>
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
        onSubmit={onUpdate}
        initialDiskState={initialDiskState}
        initialDiskSourceState={initialDiskSourceState}
      />
    ));
  };

  return (
    <Dropdown
      onSelect={() => setIsDropdownOpen(false)}
      toggle={
        <KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" isDisabled={isDisabled} />
      }
      isOpen={isDropdownOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          onClick={onEditModalToggle}
          key="disk-edit"
          isDisabled={hasSourceRef}
          description={hasSourceRef ? t("This disk's source is not editable") : null}
        >
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
