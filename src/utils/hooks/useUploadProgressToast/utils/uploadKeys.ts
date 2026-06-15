import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getClusterNamespaceNameKey,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

export const UPLOAD_KEY_PREFIX = {
  bootableVolume: 'bootable-volume',
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

export const getVmCdromUploadKeyFromVm = (vm: V1VirtualMachine, cdromDiskName: string): string =>
  getVmCdromUploadKey(getCluster(vm), getNamespace(vm), getName(vm), cdromDiskName);

export const getBootableVolumeUploadKey = (namespace: string, name: string): string =>
  buildScopedUploadKey(UPLOAD_KEY_PREFIX.bootableVolume, `${namespace}/${name}`);
