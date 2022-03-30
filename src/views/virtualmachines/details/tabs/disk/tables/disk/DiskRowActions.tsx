import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EditDiskModal from '@kubevirt-utils/components/DiskModal/EditDiskModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';

import { useEditDiskStates } from './hooks/useEditDiskStates';

type DiskRowActionsProps = {
  vm: V1VirtualMachine;
  diskName: string;
  pvcResourceExists: boolean;
};

const DiskRowActions: React.FC<DiskRowActionsProps> = ({ vm, diskName, pvcResourceExists }) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const { initialDiskState, initialDiskSourceState } = useEditDiskStates(vm, diskName);

  const isVMRunning = vm?.status?.printableStatus !== printableVMStatus.Stopped;
  const editBtnText = t('Edit');

  const disabledEditText = React.useMemo(() => {
    if (isVMRunning) {
      return t('Can edit only when VM is stopped');
    }
    if (pvcResourceExists) {
      return t('Cannot edit resources that already created');
    }
    return null;
  }, [isVMRunning, pvcResourceExists, t]);

  const onEditModalOpen = () => {
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  const onSubmit = (updatedVM) =>
    k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM?.metadata?.namespace,
      name: updatedVM?.metadata?.name,
    });

  const items = [
    <DropdownItem
      onClick={onEditModalOpen}
      key="disk-edit"
      isDisabled={isVMRunning || pvcResourceExists}
      description={disabledEditText}
    >
      {editBtnText}
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
      {isEditModalOpen && (
        <EditDiskModal
          vm={vm}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          headerText={t('Edit disk')}
          onSubmit={onSubmit}
          initialDiskState={initialDiskState}
          initialDiskSourceState={initialDiskSourceState}
        />
      )}
    </>
  );
};

export default DiskRowActions;
