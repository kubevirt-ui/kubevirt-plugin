import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { vmimStatuses } from './statuses';

type MigrationStatusCounts = {
  failed: number;
  other: number;
  running: number;
  scheduled: number;
};

/**
 * Counts migration statuses from a list of VMIMs.
 * Phases that are not Failed, Running, Scheduled, or Scheduling are counted as "other".
 * @param vmims
 */
export const getMigrationStatusCounts = (
  vmims: V1VirtualMachineInstanceMigration[],
): MigrationStatusCounts => {
  return (vmims || []).reduce(
    (acc, vmim) => {
      const phase = vmim?.status?.phase;
      if (phase === vmimStatuses.Failed) {
        acc.failed++;
      } else if (phase === vmimStatuses.Running) {
        acc.running++;
      } else if ([vmimStatuses.Scheduled, vmimStatuses.Scheduling].includes(phase)) {
        acc.scheduled++;
      } else if (phase) {
        acc.other++;
      }
      return acc;
    },
    { failed: 0, other: 0, running: 0, scheduled: 0 },
  );
};
