export const PVC_SOURCE_NAME = 'pvc-clone';
export const HTTP_SOURCE_NAME = 'http';
export const REGISTRY_SOURCE_NAME = 'registry';
export const DEFAULT_SOURCE = 'default';
export const BLANK_SOURCE_NAME = 'blank';
export const UPLOAD_SOURCE_NAME = 'upload';
export const CONTAINER_DISK_SOURCE_NAME = 'container-disk';
export const PVC_EPHEMERAL_SOURCE_NAME = 'pvc';

export type SOURCE_OPTIONS_IDS =
  | typeof DEFAULT_SOURCE
  | typeof PVC_SOURCE_NAME
  | typeof HTTP_SOURCE_NAME
  | typeof REGISTRY_SOURCE_NAME
  | typeof BLANK_SOURCE_NAME
  | typeof UPLOAD_SOURCE_NAME
  | typeof CONTAINER_DISK_SOURCE_NAME
  | typeof PVC_EPHEMERAL_SOURCE_NAME;

export enum PVC_SIZE_FORMATS {
  Mi = 'Mi',
  Gi = 'Gi',
  Ti = 'Ti',
}
