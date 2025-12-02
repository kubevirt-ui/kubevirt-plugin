import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useProviderByClusterName from '@multicluster/components/CrossClusterMigration/hooks/useProviderByClusterName';
import { FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { isLiveMigratable, isPaused, isRunning, isStopped } from '@virtualmachines/utils';
import { VMIMMapper } from '@virtualmachines/utils/mappers';

import { BulkVirtualMachineActionFactory } from '../BulkVirtualMachineActionFactory';

import { ACTIONS_ID } from './constants';
import useIsMTCInstalled from './useIsMTCInstalled';
import useIsMTVInstalled from './useIsMTVInstalled';
import { someVMIsMigrating } from './utils';

type UseMultipleVirtualMachineActions = (
  vms: V1VirtualMachine[],
  vmimMapper: VMIMMapper,
) => ActionDropdownItemType[];

const useMultipleVirtualMachineActions: UseMultipleVirtualMachineActions = (vms, vmimMapper) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
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
    const namespaces = new Set(vms?.map((vm) => getNamespace(vm)));
    const clusters = new Set(vms?.map((vm) => getCluster(vm)));

    const migrateCompute = BulkVirtualMachineActionFactory.migrateCompute(
      vms.filter(isLiveMigratable),
      createModal,
    );
    const migrateStorage = BulkVirtualMachineActionFactory.migrateStorage(vms, createModal);

    const migrationActions =
      namespaces.size === 1 && mtcInstalled ? [migrateCompute, migrateStorage] : [migrateCompute];

    if (clusters.size === 1 && namespaces.size === 1 && crossClusterMigrationEnabled) {
      migrationActions.unshift(
        BulkVirtualMachineActionFactory.crossClusterMigration(
          vms,
          createModal,
          providerLoaded && isEmpty(provider),
        ),
      );
    }

    const hasMigratingVM = someVMIsMigrating(vms, vmimMapper);
    const hasRunningVM = vms?.some(isRunning);
    const hasProtectedVM = vms?.some(isDeletionProtectionEnabled);
    const isDeleteDisabled = hasRunningVM || hasProtectedVM;

    const actions: ActionDropdownItemType[] = [
      BulkVirtualMachineActionFactory.start(vms),
      BulkVirtualMachineActionFactory.stop(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.restart(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.pause(vms, createModal, confirmVMActionsEnabled),
      BulkVirtualMachineActionFactory.unpause(vms),
      BulkVirtualMachineActionFactory.snapshot(vms, createModal),
      ...(migrationActions.length > 0
        ? [
            {
              cta: null,
              disabled: hasMigratingVM,
              id: 'bulk-migration-actions',
              label: t('Migration'),
              options: migrationActions,
            },
          ]
        : []),
      ...(treeViewFoldersEnabled
        ? [BulkVirtualMachineActionFactory.moveToFolder(vms, createModal)]
        : []),
      BulkVirtualMachineActionFactory.editLabels(vms, createModal),
      BulkVirtualMachineActionFactory.delete(vms, createModal, isDeleteDisabled),
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
    vmimMapper,
  ]);
};

export default useMultipleVirtualMachineActions;
