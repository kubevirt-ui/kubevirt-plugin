import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
  setCustomizeWizardVMSignal,
  updateVMCustomizeIT,
} from './customizeWizardVMSignal';

jest.mock('@preact/signals-react', () => ({
  signal: jest.fn(() => {
    const mockSignal = { value: null };
    return mockSignal;
  }),
}));

describe('customizeWizardVMSignal', () => {
  const mockVM: V1VirtualMachine = {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: 'test-vm',
      namespace: 'default',
    },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              disks: [
                {
                  disk: { bus: 'virtio' },
                  name: 'rootdisk',
                },
              ],
              interfaces: [
                {
                  masquerade: {},
                  name: 'default',
                },
              ],
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    // Reset the signal value before each test
    customizeWizardVMSignal.value = null;
    jest.clearAllMocks();
  });

  describe('patchVMSignal', () => {
    it('should replace the entire VM object when path is empty', () => {
      customizeWizardVMSignal.value = mockVM;
      const newVM = { ...mockVM, metadata: { ...mockVM.metadata, name: 'new-vm' } };

      const result = patchCustomizeWizardVMSignal([{ data: newVM }]);

      expect(result).toEqual(newVM);
      expect(customizeWizardVMSignal.value).toEqual(newVM);
    });

    it('should update a simple property using string path', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([{ data: 'new-name', path: 'metadata.name' }]);

      expect(result.metadata.name).toBe('new-name');
      expect(result.spec).toEqual(mockVM.spec);
    });

    it('should update a nested property using string path', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'sata', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('sata');
    });

    it('should update a property using array path', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'new-namespace', path: ['metadata', 'namespace'] },
      ]);

      expect(result.metadata.namespace).toBe('new-namespace');
    });

    it('should create nested objects when they do not exist', () => {
      customizeWizardVMSignal.value = {
        ...mockVM,
        spec: {
          template: {
            spec: {
              domain: {
                devices: {
                  disks: [],
                  interfaces: [],
                },
              },
            },
          },
        },
      };

      const result = patchCustomizeWizardVMSignal([
        { data: 'virtio', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('virtio');
    });

    it('should merge data when merge is true', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        {
          data: { newLabel: 'new-value' },
          merge: true,
          path: 'metadata.labels',
        },
      ]);

      expect(result.metadata.labels).toEqual({
        ...mockVM.metadata.labels,
        newLabel: 'new-value',
      });
    });

    it('should handle multiple updates in sequence', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'updated-name', path: 'metadata.name' },
        { data: 'updated-namespace', path: 'metadata.namespace' },
        { data: 'virtio', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.metadata.name).toBe('updated-name');
      expect(result.metadata.namespace).toBe('updated-namespace');
      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('virtio');
    });

    it('should filter out empty string parts from path', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'updated-name', path: 'metadata..name' },
      ]);

      expect(result.metadata.name).toBe('updated-name');
    });

    it('should skip update when path is empty string', () => {
      customizeWizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = patchCustomizeWizardVMSignal([{ data: 'should-not-change', path: '' }]);

      expect(result).toEqual(originalVM);
    });

    it('should skip update when all path parts are empty strings', () => {
      customizeWizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = patchCustomizeWizardVMSignal([
        { data: 'should-not-change', path: ['', '', ''] },
      ]);

      expect(result).toEqual(originalVM);
    });

    it('should handle array updates correctly', () => {
      customizeWizardVMSignal.value = mockVM;

      const newDisks = [
        { disk: { bus: 'virtio' }, name: 'disk1' },
        { disk: { bus: 'sata' }, name: 'disk2' },
      ];

      const result = patchCustomizeWizardVMSignal([
        { data: newDisks, path: 'spec.template.spec.domain.devices.disks' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks).toEqual(newDisks);
    });

    it('should create a deep copy and not mutate the original signal value', () => {
      customizeWizardVMSignal.value = mockVM;
      const originalSignalValue = customizeWizardVMSignal.value;

      patchCustomizeWizardVMSignal([{ data: 'updated-name', path: 'metadata.name' }]);

      // The original signal value should be unchanged
      expect(originalSignalValue.metadata.name).toBe('test-vm');
      // But the signal should have the updated value
      expect(customizeWizardVMSignal.value.metadata.name).toBe('updated-name');
    });

    it('should handle complex nested object updates', () => {
      customizeWizardVMSignal.value = mockVM;

      const newInterface = {
        bridge: {},
        model: 'virtio',
        name: 'new-interface',
      };

      const result = patchCustomizeWizardVMSignal([
        { data: newInterface, path: 'spec.template.spec.domain.devices.interfaces.1' },
      ]);

      expect(result.spec.template.spec.domain.devices.interfaces[1]).toEqual(newInterface);
      expect(result.spec.template.spec.domain.devices.interfaces[0]).toEqual(
        mockVM.spec.template.spec.domain.devices.interfaces[0],
      );
    });
  });

  describe('setCustomizeWizardVMSignal', () => {
    it('should set the signal value', () => {
      setCustomizeWizardVMSignal(mockVM);

      expect(customizeWizardVMSignal.value).toEqual(mockVM);
    });

    it('should clear the signal value when set to null', () => {
      customizeWizardVMSignal.value = mockVM;

      setCustomizeWizardVMSignal(null);

      expect(customizeWizardVMSignal.value).toBeNull();
    });
  });

  describe('updateVMCustomizeIT', () => {
    it('should return a promise that resolves with the updated VM', async () => {
      customizeWizardVMSignal.value = mockVM;
      const newVM = { ...mockVM, metadata: { ...mockVM.metadata, name: 'promise-vm' } };

      const result = await updateVMCustomizeIT(newVM);

      expect(result).toEqual(newVM);
      expect(customizeWizardVMSignal.value).toEqual(newVM);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined signal value', () => {
      customizeWizardVMSignal.value = null;

      const result = patchCustomizeWizardVMSignal([{ data: 'test', path: 'metadata.name' }]);

      expect(result).toBeUndefined();
    });

    it('should handle undefined data', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([{ data: undefined, path: 'metadata.name' }]);

      expect(result.metadata.name).toBeUndefined();
    });

    it('should handle null data', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([{ data: null, path: 'metadata.name' }]);

      expect(result.metadata.name).toBeNull();
    });

    it('should handle empty updateValues array', () => {
      customizeWizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = patchCustomizeWizardVMSignal([]);

      expect(result).toEqual(originalVM);
    });

    it('should handle deeply nested paths', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        {
          data: 'deep-value',
          path: 'spec.template.spec.domain.devices.disks.0.disk.bus',
        },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('deep-value');
    });

    it('should handle array index paths', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'new-interface', path: 'spec.template.spec.domain.devices.interfaces.0.name' },
      ]);

      expect(result.spec.template.spec.domain.devices.interfaces[0].name).toBe('new-interface');
    });
  });

  describe('object corruption prevention', () => {
    it('should not create empty string keys', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'test', path: 'metadata.name' },
        { data: 'test2', path: '' }, // This should be ignored
        { data: 'test3', path: 'metadata.namespace' },
      ]);

      expect(result).not.toHaveProperty('');
      expect(result.metadata.name).toBe('test');
      expect(result.metadata.namespace).toBe('test3');
    });

    it('should not create corrupted nested structures', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'test', path: 'spec.template.spec.domain.devices.disks.0.name' },
        { data: 'test2', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].name).toBe('test');
      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('test2');
      expect(result).not.toHaveProperty('');
    });

    it('should maintain object structure integrity with multiple updates', () => {
      customizeWizardVMSignal.value = mockVM;

      const result = patchCustomizeWizardVMSignal([
        { data: 'updated-vm', path: 'metadata.name' },
        { data: 'updated-ns', path: 'metadata.namespace' },
        { data: 'virtio', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
        { data: 'rootdisk', path: 'spec.template.spec.domain.devices.disks.0.name' },
      ]);

      // Verify the structure is intact
      expect(result.apiVersion).toBe('kubevirt.io/v1');
      expect(result.kind).toBe('VirtualMachine');
      expect(result.metadata.name).toBe('updated-vm');
      expect(result.metadata.namespace).toBe('updated-ns');
      expect(result.spec.template.spec.domain.devices.disks[0].name).toBe('rootdisk');
      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('virtio');

      // Verify no corruption
      expect(result).not.toHaveProperty('');
      expect(Object.keys(result)).toEqual(['apiVersion', 'kind', 'metadata', 'spec']);
    });
  });
});
