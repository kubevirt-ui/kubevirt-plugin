import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/resources/vm/utils/constants';

import { getRunStrategyAppliedOnStart } from '../startVMRunStrategy';

const vmWithStrategy = (
  runStrategy?: V1VirtualMachine['spec']['runStrategy'],
  running?: boolean,
): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'vm', namespace: 'default' },
  spec: {
    ...(runStrategy ? { runStrategy } : {}),
    ...(running !== undefined ? { running } : {}),
  },
});

describe('getRunStrategyAppliedOnStart', () => {
  it('uses RerunOnFailure when the virtual machine is Halted', () => {
    expect(getRunStrategyAppliedOnStart(vmWithStrategy(RUNSTRATEGY_HALTED))).toBe(
      RUNSTRATEGY_RERUNONFAILURE,
    );
  });

  it('uses RerunOnFailure when the deprecated running field is false', () => {
    expect(getRunStrategyAppliedOnStart(vmWithStrategy(undefined, false))).toBe(
      RUNSTRATEGY_RERUNONFAILURE,
    );
  });

  it('leaves an existing running strategy unchanged', () => {
    expect(
      getRunStrategyAppliedOnStart(vmWithStrategy(RUNSTRATEGY_RERUNONFAILURE)),
    ).toBeUndefined();
    expect(getRunStrategyAppliedOnStart(vmWithStrategy(RUNSTRATEGY_ALWAYS))).toBeUndefined();
    expect(getRunStrategyAppliedOnStart(vmWithStrategy(RUNSTRATEGY_MANUAL))).toBeUndefined();
  });
});
