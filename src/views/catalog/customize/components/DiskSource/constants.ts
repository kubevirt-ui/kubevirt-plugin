import { V1beta1DataVolumeSource } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const PVC_DISK_SOURCE_NAME = 'pvc';
export const HTTP_DISK_SOURCE_NAME = 'http';
export const REGISTRY_DISK_SOURCE_NAME = 'registry';
export const DEFAULT_DISK_SOURCE = 'default';

export type DISK_SOURCE_OPTIONS_IDS =
  | typeof DEFAULT_DISK_SOURCE
  | typeof PVC_DISK_SOURCE_NAME
  | typeof HTTP_DISK_SOURCE_NAME
  | typeof REGISTRY_DISK_SOURCE_NAME;

export enum PVC_SIZE_FORMATS {
  MiB = 'MiB',
  GiB = 'GiB',
  TiB = 'TiB',
}

export type DISK_SOURCE = {
  storage?: string;
  source: V1beta1DataVolumeSource;
};
