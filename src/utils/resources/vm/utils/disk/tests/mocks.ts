import {
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge utility for test factories.
 * Needed because tests often override nested properties (e.g., `disk: { bus: 'sata' }`)
 * while preserving other nested defaults. Simple spread would replace entire objects.
 * Uses JSON.parse(JSON.stringify()) to ensure nested references are not shared between tests.
 * @param base - The base object to merge into
 * @param overrides - The partial object with properties to override
 */
const deepMerge = <T extends object>(base: T, overrides: DeepPartial<T>): T => {
  const result = JSON.parse(JSON.stringify(base)) as T;
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

const BASE_DISK: V1Disk = {
  disk: { bus: 'virtio' },
  name: 'test-disk',
};

const BASE_VOLUME: V1Volume = {
  name: 'test-volume',
};

const BASE_VM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'test-vm', namespace: 'default' },
  spec: { template: {} },
};

const BASE_VMI: V1VirtualMachineInstance = {
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
  deepMerge(BASE_DISK, overrides);

export const createVolume = (overrides: DeepPartial<V1Volume> = {}): V1Volume =>
  deepMerge(BASE_VOLUME, overrides);

export const createVM = (
  name: string,
  overrides: DeepPartial<V1VirtualMachine> = {},
): V1VirtualMachine =>
  deepMerge(BASE_VM, {
    ...overrides,
    metadata: { ...overrides.metadata, name },
  });

export const createVMI = (
  disks: V1Disk[] = [],
  volumes: V1Volume[] = [],
  overrides: DeepPartial<V1VirtualMachineInstance> = {},
): V1VirtualMachineInstance =>
  deepMerge(BASE_VMI, {
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
