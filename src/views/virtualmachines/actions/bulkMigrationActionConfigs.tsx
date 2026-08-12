import React from 'react';
import { type TFunction } from 'i18next';

import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  STORAGE_MIGRATION_API,
  type StorageMigrationAPI,
} from '@kubevirt-utils/resources/migrations/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNoPermissionTooltipContent, isEmpty } from '@kubevirt-utils/utils/utils';
import CrossClusterMigration from '@multicluster/components/CrossClusterMigration/CrossClusterMigration';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { isLiveMigratable, isRunning } from '../utils';

import { migrateVM } from './actions';
import ConfirmMultipleVMActionsModal from './components/ConfirmMultipleVMActionsModal/ConfirmMultipleVMActionsModal';
import VirtualMachineMigrateModal from './components/VirtualMachineMigration/VirtualMachineMigrationModal';
import { BULK_ACTIONS_ID } from './hooks/constants';

export const createCrossClusterMigrationConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    isDisabled: boolean,
  ): ActionDropdownItemType => {
    const allRunning = vms?.every(isRunning);

    return {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CrossClusterMigration close={onClose} isOpen={isOpen} resources={vms} />
        )),
      disabled: isEmpty(vms) || isDisabled || !allRunning,
      disabledTooltip: !allRunning
        ? t('All VirtualMachines must be running')
        : t('Cross-cluster migration is not supported on this cluster.'),
      id: CROSS_CLUSTER_MIGRATION_ACTION_ID,
      label: t('Cross-cluster migration'),
    };
  };

export const createMigrateComputeConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    const migratableVMs = vms?.filter(isLiveMigratable) || [];
    const nonMigratableVMs = vms?.filter((vm) => !isLiveMigratable(vm)) || [];
    const hasNoMigratableVMs = isEmpty(migratableVMs);

    return {
      accessReview: {
        cluster: getCluster(vms?.[0]),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: getNamespace(vms?.[0]),
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <ConfirmMultipleVMActionsModal
            action={migrateVM}
            actionType="Migrate"
            excludedVMs={!isEmpty(nonMigratableVMs) ? nonMigratableVMs : undefined}
            excludedVMsReason={
              nonMigratableVMs.length > 1
                ? t('are not eligible for live migration and will not be migrated.')
                : t('is not eligible for live migration and will not be migrated.')
            }
            includedVMsDescription={t('will be migrated.')}
            isOpen={isOpen}
            onClose={onClose}
            vms={migratableVMs}
          />
        )),
      description: t('Migrate VirtualMachines to a different Node'),
      disabled: hasNoMigratableVMs,
      disabledTooltip: hasNoMigratableVMs
        ? t('None of the selected VirtualMachines are eligible for live migration')
        : getNoPermissionTooltipContent(t),
      id: BULK_ACTIONS_ID.MIGRATE_COMPUTE,
      label: t('Compute'),
    };
  };

export const createMigrateStorageConfig =
  (t: TFunction) =>
  (
    vms: V1VirtualMachine[],
    createModal: (modal: ModalComponent) => void,
    storageMigAPI: StorageMigrationAPI = STORAGE_MIGRATION_API.MULTI_NS,
  ): ActionDropdownItemType => {
    const isLoading = storageMigAPI === STORAGE_MIGRATION_API.LOADING;
    const isUnavailable = storageMigAPI === STORAGE_MIGRATION_API.NONE;
    const backend = getStorageMigrationBackend(storageMigAPI);
    const planModel = backend?.planModel ?? null;
    const planNamespace = backend?.fixedPlanNamespace ?? getNamespace(vms?.[0]);

    const accessReviewModel = planModel ?? MultiNamespaceVirtualMachineStorageMigrationPlanModel;

    const migrateStorageDisabledTooltip = (): string => {
      if (isLoading) return t('Checking storage migration availability...');
      if (isUnavailable) return t('Storage migration is not available on this cluster.');
      return getNoPermissionTooltipContent(t);
    };

    return {
      accessReview: {
        cluster: getCluster(vms?.[0]),
        group: accessReviewModel.apiGroup,
        namespace: planModel ? planNamespace : getNamespace(vms?.[0]),
        resource: accessReviewModel.plural,
        verb: 'create',
      },
      cta: () =>
        createModal((props) => (
          <VirtualMachineMigrateModal storageMigAPI={storageMigAPI} vms={vms} {...props} />
        )),
      description: t('Migrate VirtualMachine storage to a different StorageClass'),
      disabled: isLoading || isUnavailable || !planModel,
      disabledTooltip: migrateStorageDisabledTooltip(),
      id: BULK_ACTIONS_ID.MIGRATE_STORAGE,
      label: t('Storage'),
    };
  };
