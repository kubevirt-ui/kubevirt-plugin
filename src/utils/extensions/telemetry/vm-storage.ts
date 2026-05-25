import { V1VirtualMachine, V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  VM_CLONED,
  VM_DISK_ATTACHED,
  VM_DISK_HOTPLUG_ADDED,
  VM_DISK_HOTPLUG_FAILED,
  VM_DISK_HOTPLUG_REMOVED,
  VM_DISK_SUMMARY,
  VM_SNAPSHOT_CREATED,
  VM_SNAPSHOT_RESTORED,
} from './utils/constants';
import {
  TELEMETRY_DISK_TYPE,
  TELEMETRY_HOTPLUG_OPERATION,
  TELEMETRY_VM_STATE,
} from './utils/property-constants';
import { HotplugOperationTelemetry, SnapshotStatusTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

const getDiskTypes = (volumes: V1Volume[]): string[] =>
  volumes
    .map((volume) => {
      if (volume.persistentVolumeClaim) return TELEMETRY_DISK_TYPE.PERSISTENT_VOLUME_CLAIM;
      if (volume.containerDisk) return TELEMETRY_DISK_TYPE.CONTAINER_DISK;
      if (volume.dataVolume) return TELEMETRY_DISK_TYPE.DATA_VOLUME;
      if (volume.ephemeral) return TELEMETRY_DISK_TYPE.EPHEMERAL;
      return TELEMETRY_DISK_TYPE.OTHER;
    })
    .filter((type, index, arr) => arr.indexOf(type) === index);

export const logVMDiskAttached = (properties?: {
  provisioner?: string;
  requestedSizeGi?: number;
  storageClass?: string;
}) => {
  eventMonitor(VM_DISK_ATTACHED, properties ?? {});
};

export const logVMDiskHotplug = (operation: HotplugOperationTelemetry, error?: Error | string) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    eventMonitor(VM_DISK_HOTPLUG_FAILED, {
      errorMessage,
      operation,
      vmState: TELEMETRY_VM_STATE.RUNNING,
    });
    return;
  }

  const eventName =
    operation === TELEMETRY_HOTPLUG_OPERATION.ADD ? VM_DISK_HOTPLUG_ADDED : VM_DISK_HOTPLUG_REMOVED;
  eventMonitor(eventName, { operation, vmState: TELEMETRY_VM_STATE.RUNNING });
};

export const logVMSnapshotCreated = (
  status: SnapshotStatusTelemetry,
  properties?: {
    errorMessage?: string;
    snapshotSizeMB?: number;
  },
) => {
  eventMonitor(VM_SNAPSHOT_CREATED, { status, ...properties });
};

export const logVMSnapshotRestored = (
  status: SnapshotStatusTelemetry,
  properties?: {
    errorMessage?: string;
  },
) => {
  eventMonitor(VM_SNAPSHOT_RESTORED, { status, ...properties });
};

export const logVMCloned = (properties: {
  diskSizeGi?: number;
  sourceStorageClass?: string;
  status: SnapshotStatusTelemetry;
  targetStorageClass?: string;
}) => {
  eventMonitor(VM_CLONED, properties);
};

export const logVMDiskSummary = (vm: V1VirtualMachine) => {
  const volumes = vm?.spec?.template?.spec?.volumes ?? [];
  eventMonitor(VM_DISK_SUMMARY, {
    diskCount: volumes.length,
    diskTypes: getDiskTypes(volumes),
  });
};
