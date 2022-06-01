import * as React from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteResourceMessage from '@kubevirt-utils/components/DeleteResourceMessage/DeleteResourceMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

import RestoreModal from '../modal/RestoreModal';

type SnapshotActionsMenuProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
  isRestoreDisabled: boolean;
};

const SnapshotActionsMenu: React.FC<SnapshotActionsMenuProps> = ({
  snapshot,
  isRestoreDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const deleteLabel = t('Delete VirtualMachineSnapshot');

  const onRestoreModalToggle = React.useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <RestoreModal snapshot={snapshot} isOpen={isOpen} onClose={onClose} />
    ));
    setIsDropdownOpen(false);
  }, [createModal, snapshot]);

  const onDeleteModalToggle = React.useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1alpha1VirtualMachineSnapshot>
        isOpen={isOpen}
        onClose={onClose}
        obj={snapshot}
        onSubmit={(obj) =>
          k8sDelete({
            model: VirtualMachineSnapshotModel,
            resource: obj,
          })
        }
        headerText={deleteLabel}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
      >
        <DeleteResourceMessage obj={snapshot} />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  }, [createModal, deleteLabel, snapshot, t]);

  const items = [
    <DropdownItem
      description={t('Restore is enabled only for offline VirtualMachine.')}
      onClick={onRestoreModalToggle}
      key="snapshot-resotre"
      isDisabled={isRestoreDisabled}
    >
      {t('Restore')}
    </DropdownItem>,
    <DropdownItem onClick={onDeleteModalToggle} key="snapshot-delete">
      {deleteLabel}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
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

export default SnapshotActionsMenu;
