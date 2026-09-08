import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { filterConditions } from './utils';

describe('filterConditions', () => {
  it('keeps DataVolumesReady with a reason and LiveMigratable=True', () => {
    const vm = {
      status: {
        conditions: [
          { reason: 'AllDVsReady', status: 'True', type: 'DataVolumesReady' },
          { status: 'True', type: 'LiveMigratable' },
          { status: 'True', type: 'Ready' },
        ],
        printableStatus: 'Running',
      },
    } as V1VirtualMachine;

    expect(
      filterConditions(vm)?.map((condition) => `${condition.type}=${condition.status}`),
    ).toEqual(['DataVolumesReady=True', 'LiveMigratable=True']);
  });

  it('omits LiveMigratable=False', () => {
    const vm = {
      status: {
        conditions: [{ reason: 'DisksNotShared', status: 'False', type: 'LiveMigratable' }],
        printableStatus: 'Running',
      },
    } as V1VirtualMachine;

    expect(filterConditions(vm)).toEqual([]);
  });
});
