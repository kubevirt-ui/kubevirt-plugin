import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineRestoreModel } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getVolumeSnapshotStatusesPartition = (
  volumeSnapshotStatuses: V1VolumeSnapshotStatus[],
) => {
  const supportedVolumes = volumeSnapshotStatuses?.filter((status) => status?.enabled);
  const unsupportedVolumes = volumeSnapshotStatuses?.filter((status) => !status?.enabled);
  return {
    supportedVolumes,
    unsupportedVolumes,
  };
};

export const getVolumeSnapshotStatusesPartitionPerVM = (vms: V1VirtualMachine[]) =>
  vms.reduce<{
    supportedVolumes: Record<string, V1VolumeSnapshotStatus[]>;
    unsupportedVolumes: Record<string, V1VolumeSnapshotStatus[]>;
  }>(
    (acc, vm) => {
      const volumeSnapshotStatuses = getVolumeSnapshotStatuses(vm);
      const { supportedVolumes, unsupportedVolumes } =
        getVolumeSnapshotStatusesPartition(volumeSnapshotStatuses);
      const vmName = getName(vm);

      return {
        supportedVolumes: {
          ...acc.supportedVolumes,
          ...(!isEmpty(supportedVolumes) && { [vmName]: supportedVolumes }),
        },
        unsupportedVolumes: {
          ...acc.unsupportedVolumes,
          ...(!isEmpty(unsupportedVolumes) && { [vmName]: unsupportedVolumes }),
        },
      };
    },
    { supportedVolumes: {}, unsupportedVolumes: {} },
  );

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
    apiVersion: `${VirtualMachineSnapshotModel.apiGroup}/${VirtualMachineSnapshotModel.apiVersion}`,
    kind: VirtualMachineSnapshotModel.kind,
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
    apiVersion: `${VirtualMachineRestoreModel.apiGroup}/${VirtualMachineRestoreModel.apiVersion}`,
    kind: VirtualMachineRestoreModel.kind,
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
