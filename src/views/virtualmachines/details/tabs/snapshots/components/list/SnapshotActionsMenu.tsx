import * as React from 'react';

import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteResourceModal from '@kubevirt-utils/components/modals/DeleteResourceModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

type SnapshotActionsMenuProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
  restore: V1alpha1VirtualMachineRestore;
};

const SnapshotActionsMenu: React.FC<SnapshotActionsMenuProps> = ({ snapshot, restore }) => {
  const { t } = useKubevirtTranslation();
  const [isDropDropdownOpen, setIsDropDropdownOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDeleteModalToggle = () => {
    setIsDeleteModalOpen(true);
    setIsDropDropdownOpen(false);
  };

  const handleDeleteVMSnapshot = async () => {
    setIsDeleting(true);
    await k8sDelete({
      model: VirtualMachineSnapshotModel,
      resource: snapshot,
      json: undefined,
      requestInit: undefined,
    });

    await k8sDelete({
      model: VirtualMachineRestoreModel,
      resource: restore,
      json: undefined,
      requestInit: undefined,
    });
    setIsDeleting(false);
  };

  const items = [
    <DropdownItem onClick={onDeleteModalToggle} key="snapshot-delete">
      {t('Delete VirtualMachineSnapshot')}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
        onSelect={() => setIsDropDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropDropdownOpen} id="toggle-id-6" />}
        isOpen={isDropDropdownOpen}
        isPlain
        dropdownItems={items}
        position={DropdownPosition.right}
      />
      {isDeleteModalOpen && (
        <DeleteResourceModal
          obj={snapshot}
          onClose={() => setIsDeleteModalOpen(false)}
          isOpen={isDeleteModalOpen}
          onDelete={handleDeleteVMSnapshot}
          isProcessing={isDeleting}
        />
      )}
    </>
  );
};

export default SnapshotActionsMenu;
