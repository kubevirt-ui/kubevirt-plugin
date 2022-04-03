import * as React from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal, { DeleteResourceMessege } from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';

type SnapshotActionsMenuProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
};

const SnapshotActionsMenu: React.FC<SnapshotActionsMenuProps> = ({ snapshot }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const label = t('Delete VirtualMachineSnapshot');

  const snapshotResult = React.useMemo(() => snapshot, [snapshot]);

  const onDeleteModalToggle = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1alpha1VirtualMachineSnapshot>
        isOpen={isOpen}
        onClose={onClose}
        obj={snapshotResult}
        onSubmit={(obj) =>
          k8sDelete({
            model: VirtualMachineSnapshotModel,
            resource: obj,
            json: undefined,
            requestInit: undefined,
          })
        }
        headerText={label}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
      >
        <DeleteResourceMessege obj={snapshot} />
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem onClick={onDeleteModalToggle} key="snapshot-delete">
      {label}
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
