import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  V1Alpha1VirtualMachineRestoreModel,
  V1Alpha1VirtualMachineSnapshotModel,
} from '@kubevirt-utils/models';

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

export const validateSnapshotDeadline = (deadline: string): string => {
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

export const getEmptyVMSnapshotResource = (vm: V1VirtualMachine): V1beta1VirtualMachineSnapshot => {
  const snapshotResource: V1beta1VirtualMachineSnapshot = {
    apiVersion: `${V1Alpha1VirtualMachineSnapshotModel.apiGroup}/${V1Alpha1VirtualMachineSnapshotModel.apiVersion}`,
    kind: V1Alpha1VirtualMachineSnapshotModel.kind,
    metadata: {
      name: '',
      namespace: vm?.metadata?.namespace,
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
  snapshot: V1beta1VirtualMachineSnapshot,
): V1beta1VirtualMachineRestore => {
  const restoreResource: V1beta1VirtualMachineRestore = {
    apiVersion: `${V1Alpha1VirtualMachineRestoreModel.apiGroup}/${V1Alpha1VirtualMachineRestoreModel.apiVersion}`,
    kind: V1Alpha1VirtualMachineRestoreModel.kind,
    metadata: {
      name: `restore-${snapshot.metadata.name}-${new Date().getTime()}`,
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
