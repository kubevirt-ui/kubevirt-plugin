import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { CONFIRM_VM_ACTIONS, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useProviderByClusterName from '@multicluster/components/CrossClusterMigration/hooks/useProviderByClusterName';
import { getCluster } from '@multicluster/helpers/selectors';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { isLiveMigratable, isPaused, isRunning, isStopped } from '@virtualmachines/utils';
import { getVMIMFromMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

import { BulkVirtualMachineActionFactory } from '../BulkVirtualMachineActionFactory';

import useIsMTVInstalled from './useIsMTVInstalled';
import useVirtualMachineActionsProvider from './useVirtualMachineActionsProvider';
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
  const [hubClusterName] = useHubClusterName();

  const [provider, providerLoaded] = useProviderByClusterName(
    getCluster(vms?.[0]) ?? hubClusterName,
  );

  const singleVM = vms?.[0];
  const [singleVMActions] = useVirtualMachineActionsProvider(
    singleVM,
    getVMIMFromMapper(vmimMapper, getName(singleVM), getNamespace(singleVM), getCluster(singleVM)),
  );

  return useMemo(() => {
    if (vms.length === 1) {
      return singleVMActions;
    }

    const namespaces = new Set(vms?.map((vm) => getNamespace(vm)));
    const clusters = new Set(vms?.map((vm) => getCluster(vm)));

    const migrateCompute = BulkVirtualMachineActionFactory.migrateCompute(
      vms.filter(isLiveMigratable),
      createModal,
    );
    const migrateStorage = BulkVirtualMachineActionFactory.migrateStorage(vms, createModal);

    const migrationActions =
      clusters.size === 1 ? [migrateCompute, migrateStorage] : [migrateCompute];

    if (clusters.size === 1 && namespaces.size === 1 && mtvInstalled) {
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
      BulkVirtualMachineActionFactory.controlActions(
        [
          !vms.every(isRunning) && BulkVirtualMachineActionFactory.start(vms),
          !vms.every(isStopped) &&
            BulkVirtualMachineActionFactory.stop(vms, createModal, confirmVMActionsEnabled),
          !vms.every(isPaused) &&
            BulkVirtualMachineActionFactory.pause(vms, createModal, confirmVMActionsEnabled),
          BulkVirtualMachineActionFactory.unpause(vms),
          BulkVirtualMachineActionFactory.restart(vms, createModal, confirmVMActionsEnabled),
          BulkVirtualMachineActionFactory.reset(vms, createModal, confirmVMActionsEnabled),
        ].filter(Boolean),
      ),
      BulkVirtualMachineActionFactory.snapshot(vms, createModal),
      ...(migrationActions.length > 0
        ? [
            {
              cta: null,
              disabled: hasMigratingVM,
              id: 'migration-menu',
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

    return actions;
  }, [
    confirmVMActionsEnabled,
    createModal,
    mtvInstalled,
    provider,
    providerLoaded,
    treeViewFoldersEnabled,
    vms,
    vmimMapper,
    singleVMActions,
  ]);
};

export default useMultipleVirtualMachineActions;
