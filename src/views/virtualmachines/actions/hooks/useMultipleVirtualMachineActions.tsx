import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useProviderByClusterName from '@multicluster/components/CrossClusterMigration/hooks/useProviderByClusterName';
import { getCluster } from '@multicluster/helpers/selectors';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { BulkVirtualMachineActionFactory } from '../BulkVirtualMachineActionFactory';

import { ACTIONS_ID } from './constants';
import useIsMTCInstalled from './useIsMTCInstalled';
import useIsMTVInstalled from './useIsMTVInstalled';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { createModal } = useModal();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const mtvInstalled = useIsMTVInstalled();
  const [provider, providerLoaded] = useProviderByClusterName(getCluster(vms?.[0]));

  const mtcInstalled = useIsMTCInstalled();

  return useMemo(() => {
    const namespaces = new Set(vms?.map((vm) => getNamespace(vm)));
    const clusters = new Set(vms?.map((vm) => getCluster(vm)));

    const migrationActions = [];

    if (clusters.size === 1 && namespaces.size === 1 && mtvInstalled) {
      migrationActions.push(
        BulkVirtualMachineActionFactory.crossClusterMigration(
          vms,
          createModal,
          providerLoaded && isEmpty(provider),
        ),
      );
    }

    if (namespaces.size === 1 && mtcInstalled) {
      migrationActions.push(BulkVirtualMachineActionFactory.migrateStorage(vms, createModal));
    }

    const actions: ActionDropdownItemType[] = [
      BulkVirtualMachineActionFactory.start(vms),
      BulkVirtualMachineActionFactory.stop(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.restart(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.pause(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.unpause(vms),
      ...(migrationActions.length > 0
        ? [{ cta: null, id: 'bulk-migration-actions', label: 'Migrate', options: migrationActions }]
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
  }, [
    confirmVMActionsEnabled,
    createModal,
    mtcInstalled,
    mtvInstalled,
    provider,
    providerLoaded,
    treeViewFoldersEnabled,
    vms,
  ]);
};

export default useMultipleVirtualMachineActions;
