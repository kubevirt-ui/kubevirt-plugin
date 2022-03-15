export const PVC_SOURCE_NAME = 'pvc';
export const HTTP_SOURCE_NAME = 'http';
export const REGISTRY_SOURCE_NAME = 'registry';
export const DEFAULT_SOURCE = 'default';

export type SOURCE_OPTIONS_IDS =
  | typeof DEFAULT_SOURCE
  | typeof PVC_SOURCE_NAME
  | typeof HTTP_SOURCE_NAME
  | typeof REGISTRY_SOURCE_NAME;

export enum PVC_SIZE_FORMATS {
  MiB = 'MiB',
  GiB = 'GiB',
  TiB = 'TiB',
}
