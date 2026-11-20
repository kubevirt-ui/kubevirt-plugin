import {
  type V1PanicDevice,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getPanicDevices } from './domainSelectors';

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

describe('panic devices selectors', () => {
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
});
