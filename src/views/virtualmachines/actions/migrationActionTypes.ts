// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  type StorageMigrationAPI,
} from '@kubevirt-utils/resources/migrations/constants';

export type MigrationActions = {
  cancelComputeMigration: (
    vm: V1VirtualMachine,
    vmim: V1VirtualMachineInstanceMigration,
  ) => ActionDropdownItemType;
  cancelStorageMigration: (
    vm: V1VirtualMachine,
    storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
  ) => ActionDropdownItemType;
  migrateCompute: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  migrateStorage: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
    storageMigAPI?: StorageMigrationAPI,
  ) => ActionDropdownItemType;
  migrationActions: (migrationActions: ActionDropdownItemType[]) => ActionDropdownItemType;
};
