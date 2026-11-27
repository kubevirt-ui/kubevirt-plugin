import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getDefaultPanicDeviceModel } from './helpers';

const createVM = (osAnnotation?: string): V1VirtualMachine => ({
  metadata: {
    name: 'test-vm',
  },
  spec: {
    template: {
      metadata: osAnnotation
        ? {
            annotations: {
              'vm.kubevirt.io/os': osAnnotation,
            },
          }
        : undefined,
      spec: {
        domain: {
          devices: {},
        },
      },
    },
  },
});

describe('getDefaultPanicDeviceModel', () => {
  it('should prefer the preference model when provided', () => {
    expect(getDefaultPanicDeviceModel(createVM(), 'hyperv')).toBe('hyperv');
  });

  it('should use hyperv for Windows VMs without a preference model', () => {
    expect(getDefaultPanicDeviceModel(createVM('win10'))).toBe('hyperv');
  });

  it('should use pvpanic for non-Windows VMs without a preference model', () => {
    expect(getDefaultPanicDeviceModel(createVM('rhel9'))).toBe('pvpanic');
    expect(getDefaultPanicDeviceModel(createVM())).toBe('pvpanic');
  });
});
