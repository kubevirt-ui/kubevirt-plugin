import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useProviderByClusterName from '@multicluster/components/CrossClusterMigration/hooks/useProviderByClusterName';
import { FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { isSameCluster, isSameNamespace } from '@virtualmachines/actions/utils';
import { isPaused, isRunning, isStopped } from '@virtualmachines/utils';

import { BulkVirtualMachineActionFactory } from '../BulkVirtualMachineActionFactory';

import { ACTIONS_ID } from './constants';
import useIsMTCInstalled from './useIsMTCInstalled';
import useIsMTVInstalled from './useIsMTVInstalled';

type UseMultipleVirtualMachineActions = (vms: V1VirtualMachine[]) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms) => {
  const { createModal } = useModal();
  const currentCluster = useClusterParam();
  const { featureEnabled: confirmVMActionsEnabled } = useFeatures(CONFIRM_VM_ACTIONS);
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const mtvInstalled = useIsMTVInstalled();

  const { featureEnabled: crossClusterMigrationFlagEnabled } = useFeatures(
    FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION,
  );
  const crossClusterMigrationEnabled = mtvInstalled && crossClusterMigrationFlagEnabled;

  const [provider, providerLoaded] = useProviderByClusterName(getCluster(vms?.[0]));

  const mtcInstalled = useIsMTCInstalled();

  return useMemo(() => {
    const vmsInSingleNamespace = isSameNamespace(vms);
    const vmsOnSingleCluster = isSameCluster(vms);
    const onTargetCluster = currentCluster === getCluster(vms?.[0]);

    const migrationActions = [];

    if (vmsOnSingleCluster && vmsInSingleNamespace && crossClusterMigrationEnabled) {
      migrationActions.push(
        BulkVirtualMachineActionFactory.crossClusterMigration(
          vms,
          createModal,
          providerLoaded && isEmpty(provider),
        ),
      );
    }

    if (mtcInstalled) {
      migrationActions.push(
        BulkVirtualMachineActionFactory.migrateStorage(
          vms,
          createModal,
          !vmsOnSingleCluster || !onTargetCluster,
        ),
      );
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
    crossClusterMigrationEnabled,
    provider,
    providerLoaded,
    treeViewFoldersEnabled,
    vms,
  ]);
};

export default useMultipleVirtualMachineActions;
