import { ARCHITECTURE_ID } from '@kubevirt-utils/utils/architecture';

export const NODATA_ID = 'NO_DATA';
export const NODATA_TITLE = 'No data';

export enum BootableVolumesFilterID {
  ARCHITECTURE = ARCHITECTURE_ID,
  OS = 'osName',
  RESOURCE_KIND = 'resourceKind',
  SHOW_DEPRECATED_BOOTABLE_VOLUMES = 'showDeprecatedBootableVolumes',
  TYPE = 'type',
}
