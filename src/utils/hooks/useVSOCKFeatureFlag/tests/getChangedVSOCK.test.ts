import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getChangedVSOCK } from '../../../components/PendingChanges/utils/helpers';

import { createVM, createVMI } from './mocks';

describe('getChangedVSOCK — pending changes between VM and VMI', () => {
  it('should detect no change when both have VSOCK enabled', () => {
    expect(
      getChangedVSOCK(createVM({ autoattachVSOCK: true }), createVMI({ autoattachVSOCK: true })),
    ).toBe(false);
  });

  it('should detect no change when both have VSOCK disabled', () => {
    expect(
      getChangedVSOCK(createVM({ autoattachVSOCK: false }), createVMI({ autoattachVSOCK: false })),
    ).toBe(false);
  });

  it('should detect no change when neither has VSOCK set', () => {
    expect(getChangedVSOCK(createVM(), createVMI())).toBe(false);
  });

  it('should detect a change when VM enables VSOCK but VMI does not', () => {
    expect(
      getChangedVSOCK(createVM({ autoattachVSOCK: true }), createVMI({ autoattachVSOCK: false })),
    ).toBe(true);
  });

  it('should detect a change when VM disables VSOCK but VMI has it enabled', () => {
    expect(
      getChangedVSOCK(createVM({ autoattachVSOCK: false }), createVMI({ autoattachVSOCK: true })),
    ).toBe(true);
  });

  it('should detect a change when VM has VSOCK enabled but VMI has it unset', () => {
    expect(getChangedVSOCK(createVM({ autoattachVSOCK: true }), createVMI())).toBe(true);
  });

  it('should return false when VM is empty', () => {
    expect(getChangedVSOCK({} as V1VirtualMachine, createVMI({ autoattachVSOCK: true }))).toBe(
      false,
    );
  });

  it('should return false when VMI is empty', () => {
    expect(
      getChangedVSOCK(createVM({ autoattachVSOCK: true }), {} as V1VirtualMachineInstance),
    ).toBe(false);
  });
});
