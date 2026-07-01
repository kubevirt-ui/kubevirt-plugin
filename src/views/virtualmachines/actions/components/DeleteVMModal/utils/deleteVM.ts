import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { cancelPendingVmUploads } from '@kubevirt-utils/hooks/useUploadProgressToast/cancel/cancelPendingVmUploads';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

import {
  deleteSecrets,
  detachDataVolumeTemplates,
  updateSnapshotResources,
  updateVolumeResources,
} from './helpers';

type DeleteVMParams = {
  gracePeriodOptions: { apiVersion: string; gracePeriodSeconds: number; kind: string } | null;
  secrets: IoK8sApiCoreV1Secret[];
  snapshotsToSave: V1beta1VirtualMachineSnapshot[];
  vm: V1VirtualMachine;
  volumesToSave: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[];
};

export const deleteVMWithResources = async ({
  gracePeriodOptions,
  secrets,
  snapshotsToSave,
  vm,
  volumesToSave,
}: DeleteVMParams) => {
  try {
    await cancelPendingVmUploads(vm);
  } catch (error) {
    kubevirtConsole.error('Failed to cancel pending uploads for VM before deletion:', error);
  }

  const vmOwnerRef = buildOwnerReference(vm);
  const dvToSave = volumesToSave.filter(
    (v) => v.kind === DataVolumeModel.kind,
  ) as V1beta1DataVolume[];

  await detachDataVolumeTemplates(vm, dvToSave);
  await Promise.allSettled(updateVolumeResources(volumesToSave, vmOwnerRef));
  await Promise.allSettled(updateSnapshotResources(snapshotsToSave, vmOwnerRef));
  await Promise.allSettled(deleteSecrets(secrets));

  await kubevirtK8sDelete({
    cluster: getCluster(vm),
    json: gracePeriodOptions,
    model: VirtualMachineModel,
    resource: vm,
  });
};
