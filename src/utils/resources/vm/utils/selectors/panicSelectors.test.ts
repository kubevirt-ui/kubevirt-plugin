import {
  type V1PanicDevice,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  getPanicDevices,
  hasConfiguredPanicDevices,
  isPanicDetectionEnabled,
} from './panicSelectors';

const createVM = (panicDevices?: V1PanicDevice[]): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'test-vm' },
  spec: {
    template: {
      spec: {
        domain: {
          devices: {
            ...(panicDevices ? { panicDevices } : {}),
          },
        },
      },
    },
  },
});

const createVMI = (panicDevices?: V1PanicDevice[]): V1VirtualMachineInstance => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachineInstance',
  metadata: { name: 'test-vmi' },
  spec: {
    domain: {
      devices: {
        ...(panicDevices ? { panicDevices } : {}),
      },
    },
  },
});

describe('panicSelectors', () => {
  describe('getPanicDevices', () => {
    it('should return panicDevices array of objects from a VM', () => {
      const panicDevices = [{ model: 'hyperv' }];
      expect(getPanicDevices(createVM(panicDevices))).toEqual(panicDevices);
    });

    it('should return panicDevices array of objects from a VMI', () => {
      const panicDevices = [{ model: 'pvpanic' }];
      expect(getPanicDevices(createVMI(panicDevices))).toEqual(panicDevices);
    });

    it('should return undefined when panicDevices is missing', () => {
      expect(getPanicDevices(createVM())).toBeUndefined();
      expect(getPanicDevices(createVMI())).toBeUndefined();
    });
  });

  describe('hasConfiguredPanicDevices / isPanicDetectionEnabled', () => {
    it('should return true when a model is configured', () => {
      expect(hasConfiguredPanicDevices(createVM([{ model: 'hyperv' }]))).toBe(true);
      expect(isPanicDetectionEnabled(createVM([{ model: 'pvpanic' }]))).toBe(true);
    });

    it('should return false when panic devices are missing or have no model', () => {
      expect(hasConfiguredPanicDevices(createVM())).toBe(false);
      expect(hasConfiguredPanicDevices(createVM([{}]))).toBe(false);
      expect(isPanicDetectionEnabled(createVM())).toBe(false);
    });
  });
});
