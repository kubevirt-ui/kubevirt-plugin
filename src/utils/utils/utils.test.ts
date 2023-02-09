import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';

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

      ensurePath(data, ['spec.template.spec.domain.devices']);

      expect(data.spec.template.spec.domain.devices).toBeDefined();
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

      ensurePath(data, ['spec.template']);

      expect(data.spec.template).toBeDefined();
    });
  });
});
