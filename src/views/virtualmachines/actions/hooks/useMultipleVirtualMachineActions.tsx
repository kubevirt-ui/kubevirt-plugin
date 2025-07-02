import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { BulkVirtualMachineActionFactory } from '../BulkVirtualMachineActionFactory';

import { ACTIONS_ID } from './constants';
import useIsMTCInstalled from './useIsMTCInstalled';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatureReadOnly(CONFIRM_VM_ACTIONS);
  const { featureEnabled: treeViewFoldersEnabled } = useFeatureReadOnly(TREE_VIEW_FOLDERS);

  const mtcInstalled = useIsMTCInstalled();

  return useMemo(() => {
    const namespaces = new Set(vms?.map((vm) => getNamespace(vm)));

    const actions: ActionDropdownItemType[] = [
      BulkVirtualMachineActionFactory.start(vms),
      BulkVirtualMachineActionFactory.stop(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.restart(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.pause(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.unpause(vms),
      ...(namespaces.size === 1 && mtcInstalled
        ? [BulkVirtualMachineActionFactory.migrateStorage(vms, createModal)]
        : []),
      ...(treeViewFoldersEnabled
        ? [BulkVirtualMachineActionFactory.moveToFolder(vms, createModal)]
        : []),
      BulkVirtualMachineActionFactory.editLabels(vms, createModal),
      BulkVirtualMachineActionFactory.delete(vms, createModal),
    ];

    if (vms.every(isStopped)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.STOP);
    }

    if (vms.every(isRunning)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.START);
    }

    if (vms.every(isPaused)) {
      return actions.filter((action) => action.id !== ACTIONS_ID.PAUSE);
    }

    return actions;
  }, [confirmVMActionsEnabled, createModal, mtcInstalled, treeViewFoldersEnabled, vms]);
};

export default useMultipleVirtualMachineActions;
