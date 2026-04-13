import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import {
  CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION,
  CLUSTER_PREFERENCE_NAME_ANNOTATION,
} from './constants';
import { isExpandableSpecVM, isInstanceTypeVM } from './helper';

const baseVM = (): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'vm', namespace: 'ns' },
  spec: {
    template: {
      metadata: {},
      spec: {
        domain: {
          devices: {},
        },
      },
    },
  },
});

const baseVMI = (): V1VirtualMachineInstance => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachineInstance',
  metadata: { name: 'vm', namespace: 'ns' },
  spec: { domain: { devices: {} } },
});

describe('instancetype/helper', () => {
  describe('isExpandableSpecVM', () => {
    it('is true when only spec.preference is set', () => {
      const vm: V1VirtualMachine = {
        ...baseVM(),
        spec: {
          ...baseVM().spec,
          preference: {
            kind: 'virtualmachineclusterpreference',
            name: 'windows.2k19',
          },
        },
      };

      expect(isExpandableSpecVM(vm)).toBe(true);
    });

    it('is true when spec.instancetype is set', () => {
      const vm: V1VirtualMachine = {
        ...baseVM(),
        spec: {
          ...baseVM().spec,
          instancetype: { name: 'u1.small' },
        },
      };

      expect(isExpandableSpecVM(vm)).toBe(true);
    });

    it('is false when neither preference nor instancetype is set', () => {
      expect(isExpandableSpecVM(baseVM())).toBe(false);
    });

    it('for VMI, is true when only preference annotation is set', () => {
      const vmi: V1VirtualMachineInstance = {
        ...baseVMI(),
        metadata: {
          ...baseVMI().metadata,
          annotations: {
            [CLUSTER_PREFERENCE_NAME_ANNOTATION]: 'windows.2k19',
          },
        },
      };

      expect(isExpandableSpecVM(vmi)).toBe(true);
    });
  });

  describe('isInstanceTypeVM', () => {
    it('is false when only spec.preference is set (CNV-83862)', () => {
      const vm: V1VirtualMachine = {
        ...baseVM(),
        spec: {
          ...baseVM().spec,
          preference: {
            kind: 'virtualmachineclusterpreference',
            name: 'windows.2k19',
          },
        },
      };

      expect(isInstanceTypeVM(vm)).toBe(false);
    });

    it('is true when spec.instancetype is set', () => {
      const vm: V1VirtualMachine = {
        ...baseVM(),
        spec: {
          ...baseVM().spec,
          instancetype: { name: 'u1.small' },
        },
      };

      expect(isInstanceTypeVM(vm)).toBe(true);
    });

    it('for VMI, is false when only preference annotation is set', () => {
      const vmi: V1VirtualMachineInstance = {
        ...baseVMI(),
        metadata: {
          ...baseVMI().metadata,
          annotations: {
            [CLUSTER_PREFERENCE_NAME_ANNOTATION]: 'windows.2k19',
          },
        },
      };

      expect(isInstanceTypeVM(vmi)).toBe(false);
    });

    it('for VMI, is true when cluster instancetype annotation is set', () => {
      const vmi: V1VirtualMachineInstance = {
        ...baseVMI(),
        metadata: {
          ...baseVMI().metadata,
          annotations: {
            [CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION]: 'u1.small',
          },
        },
      };

      expect(isInstanceTypeVM(vmi)).toBe(true);
    });
  });
});
