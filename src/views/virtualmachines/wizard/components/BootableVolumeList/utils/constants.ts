import type { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';

export const paginationDefaultValuesForm = [
  { title: '8', value: 8 },
  { title: '16', value: 16 },
];

export const paginationInitialStateForm: PaginationState = {
  endIndex: 8,
  page: 1,
  perPage: 8,
  startIndex: 0,
};

export const WINDOWS_BOOTSOURCE_PIPELINE = 'windows-bootsource-pipeline';

// Intentionally distinct from the Templates catalog's `osName` filter type to avoid
// colliding on the same `osName` URL query key when this list is rendered
// inside a modal opened from that page (e.g. ChangeBootSourceModal).
export const OS_NAME_FILTER_TYPE = 'bootVolumeOsName';
export const RESOURCE_KIND_FILTER_TYPE = 'resourceKind';

export const NAME_COLUMN_ID = 'name';
export const NAMESPACE_COLUMN_ID = 'namespace';
export const OPERATING_SYSTEM_COLUMN_ID = 'operating-system';
export const STORAGE_CLASS_COLUMN_ID = 'storage-class';
export const SIZE_COLUMN_ID = 'size';
export const DESCRIPTION_COLUMN_ID = 'description';

export const VOLUMES_PROJECT_FIELD_ID = 'bootable-volume-list-volumes-project';

// Resource-name prefixes on common OS-image DataSources, and the preference
// identifiers they map to under the common-instancetypes naming convention.
export const WIN_RESOURCE_NAME_PREFIX = 'win';
export const CENTOS_STREAM_RESOURCE_NAME_PREFIX = 'centos-stream';
export const CENTOS_STREAM_PREFERENCE_PREFIX = 'centos.stream';
