import * as React from 'react';
import { Trans } from 'react-i18next';

import { produceVMDisks, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

type DiskRowActionsProps = {
  diskName: string;
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ diskName }) => {
  const { vm, updateVM } = useWizardVMContext();

  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const label = t('Delete {{diskName}} disk', { diskName: diskName });
  const submitBtnText = t('Delete');

  const onDeleteModalToggle = () => {
    setIsDeleteModalOpen(true);
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem onClick={onDeleteModalToggle} key="disk-delete">
      {submitBtnText}
    </DropdownItem>,
  ];

  const onDelete = React.useCallback(() => {
    const vmWithDeletedDisk = produceVMDisks(vm, (draftVM) => {
      const volumeToDelete = draftVM.spec.template.spec.volumes.find(
        (volume) => volume.name === diskName,
      );

      if (volumeToDelete?.dataVolume?.name)
        draftVM.spec.dataVolumeTemplates.filter(
          (dataVolume) => dataVolume.metadata.name !== volumeToDelete.dataVolume.name,
        );

      draftVM.spec.template.spec.volumes = draftVM.spec.template.spec.volumes.filter(
        (volume) => volume.name !== diskName,
      );
      draftVM.spec.template.spec.domain.devices.disks =
        draftVM.spec.template.spec.domain.devices.disks.filter((disk) => disk.name !== diskName);
    });

    return updateVM(vmWithDeletedDisk);
  }, [diskName, updateVM, vm]);

  return (
    <>
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={items}
        position={DropdownPosition.right}
      />
      {isDeleteModalOpen && (
        <TabModal<V1VirtualMachine>
          onClose={() => setIsDeleteModalOpen(false)}
          isOpen={isDeleteModalOpen}
          obj={vm}
          onSubmit={onDelete}
          headerText={label}
          submitBtnText={submitBtnText}
          submitBtnVariant={ButtonVariant.danger}
        >
          <Trans t={t}>
            Are you sure you want to delete <strong>{diskName} </strong>
          </Trans>
        </TabModal>
      )}
    </>
  );
};

export default DiskRowActions;
