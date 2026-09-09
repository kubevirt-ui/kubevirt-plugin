// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import React from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  MigPlanModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  getStorageMigrationBackend,
  getStorageMigrationPlanModelForKind,
} from '@kubevirt-utils/resources/migrations/backends';
import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_API,
  type StorageMigrationAPI,
} from '@kubevirt-utils/resources/migrations/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import VirtualMachineMigrateModal from '@virtualmachines/actions/components/VirtualMachineMigration/VirtualMachineMigrationModal';

import { cancelStorageMigrationPlan } from './actions';
import { ACTIONS_ID } from './hooks/constants';
import { type MigrationActions } from './migrationActionTypes';

export const createMigrateStorageActions = (
  t: TFunction,
): Pick<MigrationActions, 'cancelStorageMigration' | 'migrateStorage'> => ({
  cancelStorageMigration: (
    vm: V1VirtualMachine,
    storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
  ): ActionDropdownItemType => {
    const cancelModel = getStorageMigrationPlanModelForKind(storageMigrationPlan?.kind);
    const cancelNamespace =
      storageMigrationPlan?.kind === MigPlanModel.kind
        ? getNamespace(storageMigrationPlan)
        : getNamespace(vm);

    return {
      accessReview: {
        cluster: getCluster(storageMigrationPlan) ?? getCluster(vm),
        group: cancelModel.apiGroup,
        namespace: cancelNamespace,
        resource: cancelModel.plural,
        verb: 'delete',
      },
      cta: () => cancelStorageMigrationPlan(vm, storageMigrationPlan),
      description:
        !!storageMigrationPlan?.metadata?.deletionTimestamp && t('Canceling ongoing migration'),
      disabled: !storageMigrationPlan || !!storageMigrationPlan?.metadata?.deletionTimestamp,
      id: 'vm-action-cancel-storage-migrate',
      label: t('Cancel storage migration'),
    };
  },
  migrateStorage: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    storageMigAPI: StorageMigrationAPI = STORAGE_MIGRATION_API.MULTI_NS,
  ): ActionDropdownItemType => {
    const isLoading = storageMigAPI === STORAGE_MIGRATION_API.LOADING;
    const isUnavailable = storageMigAPI === STORAGE_MIGRATION_API.NONE;
    const backend = getStorageMigrationBackend(storageMigAPI);
    const planModel = backend?.planModel ?? null;
    const planNamespace = backend?.fixedPlanNamespace ?? getNamespace(vm);
    const accessReviewModel = planModel ?? MultiNamespaceVirtualMachineStorageMigrationPlanModel;

    const migrateStorageDisabledTooltip = (): string => {
      if (isLoading) {
        return t('Checking storage migration availability...');
      }
      if (isUnavailable) {
        return t('Storage migration is not available on this cluster.');
      }
      return getNoPermissionTooltipContent(t);
    };

    return {
      accessReview: {
        cluster: getCluster(vm),
        group: accessReviewModel.apiGroup,
        namespace: planModel ? planNamespace : getNamespace(vm),
        resource: accessReviewModel.plural,
        verb: 'create',
      },
      cta: () =>
        createModal((props) => (
          <VirtualMachineMigrateModal storageMigAPI={storageMigAPI} vms={[vm]} {...props} />
        )),
      description: t('Migrate VirtualMachine storage to a different StorageClass'),
      disabled: isLoading || isUnavailable || !planModel,
      disabledTooltip: migrateStorageDisabledTooltip(),
      id: ACTIONS_ID.MIGRATE_STORAGE,
      label: t('Storage'),
    };
  },
});
