import React, { FC, useCallback, useState } from 'react';

import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneVMModal from '@kubevirt-utils/components/CloneVMModal/CloneVMModal';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import RestoreModal from '../modal/RestoreModal';

type SnapshotActionsMenuProps = {
  isRestoreDisabled: boolean;
  snapshot: V1alpha1VirtualMachineSnapshot;
};

const SnapshotActionsMenu: FC<SnapshotActionsMenuProps> = ({ isRestoreDisabled, snapshot }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [canClone] = useAccessReview({
    group: VirtualMachineCloneModel.apiGroup,
    namespace: snapshot.metadata.namespace,
    resource: VirtualMachineCloneModel.plural,
    verb: 'create',
  });

  const deleteLabel = t('Delete snapshot');

  const onRestoreModalToggle = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <RestoreModal isOpen={isOpen} onClose={onClose} snapshot={snapshot} />
    ));
    setIsDropdownOpen(false);
  }, [createModal, snapshot]);

  const onClone = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <CloneVMModal
        headerText={t('Create VirtualMachine from snapshot')}
        isOpen={isOpen}
        onClose={onClose}
        source={snapshot}
      />
    ));
    setIsDropdownOpen(false);
  }, [createModal, snapshot, t]);

  const onDeleteModalToggle = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1alpha1VirtualMachineSnapshot>
        onSubmit={(obj) =>
          k8sDelete({
            model: VirtualMachineSnapshotModel,
            resource: obj,
          })
        }
        headerText={t('Delete VirtualMachineSnapshot?')}
        isOpen={isOpen}
        obj={snapshot}
        onClose={onClose}
        submitBtnText={deleteLabel}
        submitBtnVariant={ButtonVariant.danger}
      >
        <ConfirmActionMessage obj={snapshot} />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  }, [createModal, deleteLabel, snapshot, t]);

  const onToggle = () => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onSelect={() => setIsDropdownOpen(false)}
      popperProps={{ position: 'right' }}
      toggle={KebabToggle({ id: 'toggle-id-6', isExpanded: isDropdownOpen, onClick: onToggle })}
    >
      <DropdownList>
        <DropdownItem
          description={t('Create a copy of the VirtualMachine from snapshot')}
          isDisabled={!canClone}
          key="snapshot-clone"
          onClick={onClone}
        >
          {t('Create VirtualMachine')}
        </DropdownItem>
        <DropdownItem
          description={t('Restore the VirtualMachine to this snapshot`s state')}
          isDisabled={isRestoreDisabled}
          key="snapshot-restore"
          onClick={onRestoreModalToggle}
        >
          {t('Restore VirtualMachine from snapshot')}
        </DropdownItem>
        <DropdownItem key="snapshot-delete" onClick={onDeleteModalToggle}>
          {deleteLabel}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default SnapshotActionsMenu;
