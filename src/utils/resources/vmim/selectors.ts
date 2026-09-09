import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const getMigrationPod = (vmim: V1VirtualMachineInstanceMigration): string | undefined =>
  vmim?.status?.migrationState?.sourcePod;

export const getMigrationSourceNode = (
  vmim: V1VirtualMachineInstanceMigration,
): string | undefined => vmim?.status?.migrationState?.sourceNode;

export const getMigrationTargetNode = (
  vmim: V1VirtualMachineInstanceMigration,
): string | undefined => vmim?.status?.migrationState?.targetNode;

export const getMigrationPhase = (vmim: V1VirtualMachineInstanceMigration): string | undefined =>
  vmim?.status?.phase;
