import { TFunction } from 'i18next';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
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

export const generateSnapshotName = (usedNames: string[]): string => {
  let generatedName = createSnapshotName();
  while (usedNames?.includes(generatedName)) {
    generatedName = createSnapshotName();
  }
  return generatedName;
};

export const validateSnapshotName = (name: string, usedNames: string[], t: TFunction): string => {
  if (name?.length === 0) {
    return t('Name is required');
  }
  if (usedNames?.includes(name)) {
    return t('Name is already in use');
  }
  return undefined;
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
