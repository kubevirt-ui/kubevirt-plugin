// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import React from 'react';
import { type TFunction } from 'i18next';

import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import ComputeMigrationModal from '@virtualmachines/actions/components/VirtualMachineComputeMigration/ComputeMigrationModal';

import { isLiveMigratable, isRunning } from '../utils';

import { cancelMigration } from './actions';
import { ACTIONS_ID } from './hooks/constants';
import { createMigrateStorageActions } from './migrateStorageActions';
import { type MigrationActions } from './migrationActionTypes';

export type { MigrationActions } from './migrationActionTypes';

export const createMigrationActions = (t: TFunction): MigrationActions => ({
  cancelComputeMigration: (
    vm: V1VirtualMachine,
    vmim: V1VirtualMachineInstanceMigration,
  ): ActionDropdownItemType => ({
    accessReview: {
      cluster: getCluster(vm),
      group: VirtualMachineInstanceMigrationModel.apiGroup,
      namespace: getNamespace(vm),
      resource: VirtualMachineInstanceMigrationModel.plural,
      verb: 'delete',
    },
    cta: () => cancelMigration(vmim),
    description: !!vmim?.metadata?.deletionTimestamp && t('Canceling ongoing migration'),
    disabled: !vmim || !!vmim?.metadata?.deletionTimestamp,
    id: ACTIONS_ID.CANCEL_COMPUTE_MIGRATION,
    label: t('Cancel compute migration'),
  }),
  migrateCompute: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => {
    const liveMigratable = isLiveMigratable(vm);

    const getDisabledTooltip = (): string => {
      if (liveMigratable) {
        return getNoPermissionTooltipContent(t);
      }
      if (!isRunning(vm)) {
        return t('The VirtualMachine is not running');
      }
      return t('The VirtualMachine is not live migratable');
    };

    return {
      accessReview: {
        cluster: getCluster(vm),
        group: VirtualMachineInstanceMigrationModel.apiGroup,
        namespace: getNamespace(vm),
        resource: VirtualMachineInstanceMigrationModel.plural,
        verb: 'create',
      },
      cta: () => createModal((props) => <ComputeMigrationModal {...props} vm={vm} />),
      description: t('Migrate VirtualMachine to a different Node'),
      disabled: !liveMigratable,
      disabledTooltip: getDisabledTooltip(),
      id: ACTIONS_ID.MIGRATE_COMPUTE,
      label: t('Compute'),
    };
  },
  migrationActions: (migrationActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: () => null,
    id: ACTIONS_ID.MIGRATION_MENU,
    label: t('Migration'),
    options: migrationActions,
  }),
  ...createMigrateStorageActions(t),
});
