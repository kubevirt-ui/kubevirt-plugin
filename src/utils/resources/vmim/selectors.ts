import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getMigrationPod = (vmim: V1VirtualMachineInstanceMigration) =>
  vmim?.status?.migrationState?.sourcePod;
