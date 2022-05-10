import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { ensurePath } from '../WizardVMContext/utils/vm-produce';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  return {
    k8sCreate: jest.fn().mockResolvedValue({}),
  };
});

describe('Test ensurePath', () => {
  describe('Only one path', () => {
    it('Non existing path', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, 'spec.template.spec.domain.devices');

      expect(data.spec.template.spec.domain.devices).toBeDefined();
    });

    it('Existing path', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, 'spec.template');

      expect(data.spec.template).toBeDefined();
    });
  });

  describe('Multiple paths', () => {
    it('Non existing paths', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, ['spec.template.spec.domain.devices', 'spec.flavor.kind']);

      expect(data.spec.template.spec.domain.devices).toBeDefined();
      expect(data.spec.flavor.kind).toBeDefined();
    });

    it('Non existing and existing paths', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, ['spec.template', 'spec.flavor.kind']);

      expect(data.spec.template).toBeDefined();
      expect(data.spec.flavor.kind).toBeDefined();
    });
  });
});
