import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getClusterNamespaceNameKey,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

export const UPLOAD_KEY_PREFIX = {
  bootableVolume: 'bootable-volume',
  exportDisk: 'export-disk',
  vmCdrom: 'vm-cdrom',
  vmDisk: 'vm-disk',
} as const;

const buildScopedUploadKey = (scope: string, resourceKey: string, suffix?: string): string =>
  suffix ? `${scope}/${resourceKey}/${suffix}` : `${scope}/${resourceKey}`;

export const getVmResourceUploadKey = (
  cluster: string,
  namespace: string,
  vmName: string,
): string => getClusterNamespaceNameKey(cluster, namespace, vmName);

export const getVmDiskUploadKey = (
  cluster: string,
  namespace: string,
  vmName: string,
  diskName: string,
): string =>
  buildScopedUploadKey(
    UPLOAD_KEY_PREFIX.vmDisk,
    getVmResourceUploadKey(cluster, namespace, vmName),
    diskName,
  );

export const getVmCdromUploadKey = (
  cluster: string,
  namespace: string,
  vmName: string,
  cdromDiskName: string,
): string =>
  buildScopedUploadKey(
    UPLOAD_KEY_PREFIX.vmCdrom,
    getVmResourceUploadKey(cluster, namespace, vmName),
    cdromDiskName,
  );

export const getUploadClusterForVm = (vm: V1VirtualMachine): string => getCluster(vm) ?? '';

export const getVmCdromUploadKeyFromVm = (vm: V1VirtualMachine, cdromDiskName: string): string =>
  getVmCdromUploadKey(getUploadClusterForVm(vm), getNamespace(vm), getName(vm), cdromDiskName);

export const getBootableVolumeUploadKey = (namespace: string, name: string): string =>
  buildScopedUploadKey(UPLOAD_KEY_PREFIX.bootableVolume, `${namespace}/${name}`);

export const getExportDiskUploadKey = (
  cluster: string,
  namespace: string,
  pvcName: string,
): string =>
  buildScopedUploadKey(
    UPLOAD_KEY_PREFIX.exportDisk,
    getClusterNamespaceNameKey(cluster, namespace, pvcName),
  );

export const isVmScopedUploadKey = (
  uploadKey: string,
  cluster: string,
  namespace: string,
  vmName: string,
): boolean => {
  const vmKey = getVmResourceUploadKey(cluster, namespace, vmName);

  return (
    uploadKey.startsWith(`${UPLOAD_KEY_PREFIX.vmDisk}/${vmKey}/`) ||
    uploadKey.startsWith(`${UPLOAD_KEY_PREFIX.vmCdrom}/${vmKey}/`)
  );
};

export const collectVmScopedUploadKeys = (
  uploads: Record<string, unknown>,
  cluster: string,
  namespace: string,
  vmName: string,
): string[] => {
  // ACM draft VMs may register uploads before vm.cluster is set (empty cluster segment).
  // When deleting a fleet VM with a cluster, also match those legacy keys.
  const clustersToMatch = cluster ? [cluster, ''] : [''];

  return Array.from(
    new Set(
      clustersToMatch.flatMap((clusterKey) =>
        Object.keys(uploads).filter((key) =>
          isVmScopedUploadKey(key, clusterKey, namespace, vmName),
        ),
      ),
    ),
  );
};
