import { TFunction } from 'i18next';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getVolumeSnapshotStatusesPartition = (
  volumeSnaoshotStatuses: V1VolumeSnapshotStatus[],
) => {
  const supportedVolumes = volumeSnaoshotStatuses?.filter((status) => status?.enabled);
  const unsupportedVolumes = volumeSnaoshotStatuses?.filter((status) => !status?.enabled);
  return {
    supportedVolumes,
    unsupportedVolumes,
  };
};

export const createSnapshotName = () => {
  return `snapshot-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

export const validateSnapshotDeadline = (deadline: string, t: TFunction): string => {
  if (deadline?.length > 0) {
    if (!Number(deadline)) {
      return t('Deadline must be a number');
    }
    if (Number(deadline) <= 0) {
      return t('Deadline must be greater than 0');
    }
  }

  return undefined;
};

export const getEmptyVMSnapshotResource = (
  vm: V1VirtualMachine,
): V1alpha1VirtualMachineSnapshot => {
  const snapshotResource: V1alpha1VirtualMachineSnapshot = {
    apiVersion: `${VirtualMachineSnapshotModel.apiGroup}/${VirtualMachineSnapshotModel.apiVersion}`,
    kind: VirtualMachineSnapshotModel.kind,
    metadata: {
      namespace: vm?.metadata?.namespace,
      name: '',
    },
    spec: {
      source: {
        apiGroup: VirtualMachineModel.apiGroup,
        kind: VirtualMachineModel.kind,
        name: vm?.metadata?.name,
      },
    },
  };
  return snapshotResource;
};

export const getVMRestoreSnapshotResource = (
  snapshot: V1alpha1VirtualMachineSnapshot,
): V1alpha1VirtualMachineRestore => {
  const restoreResource: V1alpha1VirtualMachineRestore = {
    apiVersion: `${VirtualMachineRestoreModel.apiGroup}/${VirtualMachineRestoreModel.apiVersion}`,
    kind: VirtualMachineRestoreModel.kind,
    metadata: {
      name: `resotre-${snapshot.metadata.name}-${new Date().getTime()}`,
      namespace: snapshot.metadata.namespace,
      ownerReferences: [...(snapshot.metadata.ownerReferences || [])],
    },
    spec: {
      target: {
        apiGroup: VirtualMachineModel.apiGroup,
        kind: VirtualMachineModel.kind,
        name: snapshot.spec.source.name,
      },
      virtualMachineSnapshotName: snapshot.metadata.name,
    },
  };
  return restoreResource;
};
