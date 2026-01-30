import {
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const deepMerge = <T extends object>(base: T, overrides: DeepPartial<T>): T => {
  const result = { ...base };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const overrideValue = overrides[key];
      if (overrideValue === undefined) {
        result[key] = undefined as T[Extract<keyof T, string>];
      } else if (
        typeof overrideValue === 'object' &&
        overrideValue !== null &&
        !Array.isArray(overrideValue) &&
        Object.keys(overrideValue).length > 0 &&
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key] as object, overrideValue as object) as T[Extract<
          keyof T,
          string
        >];
      } else {
        result[key] = overrideValue as T[Extract<keyof T, string>];
      }
    }
  }
  return result;
};

const baseDisk: V1Disk = {
  disk: { bus: 'virtio' },
  name: 'test-disk',
};

const baseVolume: V1Volume = {
  name: 'test-volume',
};

const baseVM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'test-vm', namespace: 'default' },
  spec: { template: {} },
};

const baseVMI: V1VirtualMachineInstance = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachineInstance',
  metadata: { name: 'test-vmi', namespace: 'default' },
  spec: {
    domain: {
      devices: { disks: [] },
    },
    volumes: [],
  },
};

export const createDisk = (overrides: DeepPartial<V1Disk> = {}): V1Disk =>
  deepMerge(baseDisk, overrides);

export const createVolume = (overrides: DeepPartial<V1Volume> = {}): V1Volume =>
  deepMerge(baseVolume, overrides);

export const createVM = (
  name: string,
  overrides: DeepPartial<V1VirtualMachine> = {},
): V1VirtualMachine =>
  deepMerge(baseVM, {
    ...overrides,
    metadata: { ...overrides.metadata, name },
  });

export const createVMI = (
  disks: V1Disk[] = [],
  volumes: V1Volume[] = [],
  overrides: DeepPartial<V1VirtualMachineInstance> = {},
): V1VirtualMachineInstance =>
  deepMerge(baseVMI, {
    ...overrides,
    spec: {
      ...overrides.spec,
      domain: {
        ...overrides.spec?.domain,
        devices: { ...overrides.spec?.domain?.devices, disks },
      },
      volumes,
    },
  });
