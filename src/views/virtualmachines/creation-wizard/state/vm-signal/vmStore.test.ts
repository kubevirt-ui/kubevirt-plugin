import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  clearWizardVM,
  setWizardVM,
  updateWizardVM,
} from '@virtualmachines/creation-wizard/state/vm-signal/utils';

import { wizardVMSignal } from './vmStore';

// Mock the utils functions
jest.mock('./vmStore', () => ({
  ...jest.requireActual('./vmStore'),
  getWizardVMFromSessionStorage: jest.fn(),
  saveWizardVMToSessionStorage: jest.fn(),
}));

// Mock the effect to prevent it from running during tests
jest.mock('@preact/signals-react', () => ({
  effect: jest.fn(),
  signal: jest.fn(() => {
    const mockSignal = { value: null };
    return mockSignal;
  }),
}));

describe('customizeVM', () => {
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
    wizardVMSignal.value = null;
    jest.clearAllMocks();
  });

  describe('updateWizardVM', () => {
    it('should replace the entire VM object when path is empty', () => {
      wizardVMSignal.value = mockVM;
      const newVM = { ...mockVM, metadata: { ...mockVM.metadata, name: 'new-vm' } };

      const result = updateWizardVM([{ data: newVM }]);

      expect(result).toEqual(newVM);
      expect(wizardVMSignal.value).toEqual(newVM);
    });

    it('should update a simple property using string path', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([{ data: 'new-name', path: 'metadata.name' }]);

      expect(result.metadata.name).toBe('new-name');
      expect(result.spec).toEqual(mockVM.spec);
    });

    it('should update a nested property using string path', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        { data: 'sata', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('sata');
    });

    it('should update a property using array path', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([{ data: 'new-namespace', path: ['metadata', 'namespace'] }]);

      expect(result.metadata.namespace).toBe('new-namespace');
    });

    it('should create nested objects when they do not exist', () => {
      wizardVMSignal.value = {
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

      const result = updateWizardVM([
        { data: 'virtio', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('virtio');
    });

    it('should merge data when merge is true', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
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
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        { data: 'updated-name', path: 'metadata.name' },
        { data: 'updated-namespace', path: 'metadata.namespace' },
        { data: 'virtio', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.metadata.name).toBe('updated-name');
      expect(result.metadata.namespace).toBe('updated-namespace');
      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('virtio');
    });

    it('should filter out empty string parts from path', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([{ data: 'updated-name', path: 'metadata..name' }]);

      expect(result.metadata.name).toBe('updated-name');
    });

    it('should skip update when path is empty string', () => {
      wizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = updateWizardVM([{ data: 'should-not-change', path: '' }]);

      expect(result).toEqual(originalVM);
    });

    it('should skip update when all path parts are empty strings', () => {
      wizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = updateWizardVM([{ data: 'should-not-change', path: ['', '', ''] }]);

      expect(result).toEqual(originalVM);
    });

    it('should handle array updates correctly', () => {
      wizardVMSignal.value = mockVM;

      const newDisks = [
        { disk: { bus: 'virtio' }, name: 'disk1' },
        { disk: { bus: 'sata' }, name: 'disk2' },
      ];

      const result = updateWizardVM([
        { data: newDisks, path: 'spec.template.spec.domain.devices.disks' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks).toEqual(newDisks);
    });

    it('should create a deep copy and not mutate the original signal value', () => {
      wizardVMSignal.value = mockVM;
      const originalSignalValue = wizardVMSignal.value;

      updateWizardVM([{ data: 'updated-name', path: 'metadata.name' }]);

      // The original signal value should be unchanged
      expect(originalSignalValue.metadata.name).toBe('test-vm');
      // But the signal should have the updated value
      expect(wizardVMSignal.value.metadata.name).toBe('updated-name');
    });

    it('should handle complex nested object updates', () => {
      wizardVMSignal.value = mockVM;

      const newInterface = {
        bridge: {},
        model: 'virtio',
        name: 'new-interface',
      };

      const result = updateWizardVM([
        { data: newInterface, path: 'spec.template.spec.domain.devices.interfaces.1' },
      ]);

      expect(result.spec.template.spec.domain.devices.interfaces[1]).toEqual(newInterface);
      expect(result.spec.template.spec.domain.devices.interfaces[0]).toEqual(
        mockVM.spec.template.spec.domain.devices.interfaces[0],
      );
    });
  });

  describe('clearWizardVM', () => {
    it('should clear the signal value and save to session storage', () => {
      wizardVMSignal.value = mockVM;

      clearWizardVM();

      expect(wizardVMSignal.value).toBeNull();
    });
  });

  describe('setWizardVM', () => {
    it('should return a promise that resolves with the updated VM', async () => {
      wizardVMSignal.value = mockVM;
      const newVM = { ...mockVM, metadata: { ...mockVM.metadata, name: 'promise-vm' } };

      const result = await setWizardVM(newVM);

      expect(result).toEqual(newVM);
      expect(wizardVMSignal.value).toEqual(newVM);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined signal value', () => {
      wizardVMSignal.value = null;

      const result = updateWizardVM([{ data: 'test', path: 'metadata.name' }]);

      expect(result).toBeNull();
    });

    it('should handle undefined data', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([{ data: undefined, path: 'metadata.name' }]);

      expect(result.metadata.name).toBeUndefined();
    });

    it('should handle null data', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([{ data: null, path: 'metadata.name' }]);

      expect(result.metadata.name).toBeNull();
    });

    it('should handle empty updateValues array', () => {
      wizardVMSignal.value = mockVM;
      const originalVM = { ...mockVM };

      const result = updateWizardVM([]);

      expect(result).toEqual(originalVM);
    });

    it('should handle deeply nested paths', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        {
          data: 'deep-value',
          path: 'spec.template.spec.domain.devices.disks.0.disk.bus',
        },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('deep-value');
    });

    it('should handle array index paths', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        { data: 'new-interface', path: 'spec.template.spec.domain.devices.interfaces.0.name' },
      ]);

      expect(result.spec.template.spec.domain.devices.interfaces[0].name).toBe('new-interface');
    });
  });

  describe('object corruption prevention', () => {
    it('should not create empty string keys', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        { data: 'test', path: 'metadata.name' },
        { data: 'test2', path: '' }, // This should be ignored
        { data: 'test3', path: 'metadata.namespace' },
      ]);

      expect(result).not.toHaveProperty('');
      expect(result.metadata.name).toBe('test');
      expect(result.metadata.namespace).toBe('test3');
    });

    it('should not create corrupted nested structures', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
        { data: 'test', path: 'spec.template.spec.domain.devices.disks.0.name' },
        { data: 'test2', path: 'spec.template.spec.domain.devices.disks.0.disk.bus' },
      ]);

      expect(result.spec.template.spec.domain.devices.disks[0].name).toBe('test');
      expect(result.spec.template.spec.domain.devices.disks[0].disk.bus).toBe('test2');
      expect(result).not.toHaveProperty('');
    });

    it('should maintain object structure integrity with multiple updates', () => {
      wizardVMSignal.value = mockVM;

      const result = updateWizardVM([
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
