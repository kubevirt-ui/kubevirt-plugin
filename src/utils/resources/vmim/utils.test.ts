import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { vmimStatuses } from './statuses';
import { getMigrationStatusCounts } from './utils';

const vmimWithPhase = (phase: string): V1VirtualMachineInstanceMigration =>
  ({
    status: { phase },
  } as V1VirtualMachineInstanceMigration);

describe('getMigrationStatusCounts', () => {
  it('counts Succeeded separately from other', () => {
    const counts = getMigrationStatusCounts([
      vmimWithPhase(vmimStatuses.Succeeded),
      vmimWithPhase(vmimStatuses.Pending),
    ]);

    expect(counts).toEqual({
      failed: 0,
      other: 1,
      running: 0,
      scheduled: 0,
      succeeded: 1,
    });
  });

  it('aggregates known phases', () => {
    expect(
      getMigrationStatusCounts([
        vmimWithPhase(vmimStatuses.Failed),
        vmimWithPhase(vmimStatuses.Running),
        vmimWithPhase(vmimStatuses.Scheduled),
        vmimWithPhase(vmimStatuses.Scheduling),
      ]),
    ).toEqual({
      failed: 1,
      other: 0,
      running: 1,
      scheduled: 2,
      succeeded: 0,
    });
  });
});
