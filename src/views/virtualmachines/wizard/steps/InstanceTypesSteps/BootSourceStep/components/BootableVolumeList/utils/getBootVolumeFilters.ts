import { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  ISO,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES_LABEL,
} from '@kubevirt-utils/resources/bootableresources/constants';
import {
  isBootableVolumeISO,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_TITLE,
  getArchitecture,
  getUniqueArchitectures,
} from '@kubevirt-utils/utils/architecture';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { getItemNameWithOther, includeFilter, isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { OS_NAME_FILTER_TYPE, RESOURCE_KIND_FILTER_TYPE } from './constants';
import { getBootVolumeOS, isLinuxGenericPreference } from './utils';

const getDeprecatedBootVolumeFilter = (t: TFunction): RowFilter<BootableVolume> => ({
  filter: (availableResourceNames, obj) =>
    isEmpty(availableResourceNames?.selected?.length) ? !isDeprecated(getName(obj)) : true,
  filterGroupName: ' ',
  items: [
    {
      id: t('Show deprecated bootable volumes'),
      title: t('Show deprecated bootable volumes'),
    },
  ],
  reducer: (obj) => isDeprecated(getName(obj)) && SHOW_DEPRECATED_BOOTABLE_VOLUMES_LABEL,
  type: SHOW_DEPRECATED_BOOTABLE_VOLUMES,
});

const getArchitectureBootVolumeFilter = (
  bootableVolumes: BootableVolume[],
  t: TFunction,
): RowFilter<BootableVolume> => {
  const architectureItems = getUniqueArchitectures(bootableVolumes).map((arch) => ({
    id: arch ?? OTHER,
    title: arch ?? t(OTHER),
  }));

  return {
    filter: (availableArchitectures, obj) =>
      includeFilter(availableArchitectures, architectureItems, getArchitecture(obj)),
    filterGroupName: ARCHITECTURE_TITLE,
    items: architectureItems,
    reducer: (obj) => getItemNameWithOther(getArchitecture(obj), architectureItems),
    type: ARCHITECTURE_ID,
  };
};

const getOperatingSystemBootVolumeFilter = (t: TFunction): RowFilter<BootableVolume> => ({
  filter: (availableOsNames, obj) =>
    isEmpty(availableOsNames?.selected?.length) ||
    availableOsNames?.selected?.includes(getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES)),
  filterGroupName: t('Operating system'),
  items: OS_NAMES,
  reducer: (obj) => getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
  type: OS_NAME_FILTER_TYPE,
});

const getResourceKindBootVolumeFilter = (t: TFunction): RowFilter<BootableVolume> => ({
  filter: (availableResourceNames, obj) =>
    isEmpty(availableResourceNames?.selected?.length) ||
    availableResourceNames?.selected?.includes(obj?.kind),
  filterGroupName: t('Resource'),
  items: [
    {
      id: DataSourceModel.kind,
      title: 'DS',
    },
  ],
  reducer: (obj) => obj?.kind,
  type: RESOURCE_KIND_FILTER_TYPE,
});

const getIsoBootVolumeFilter = (t: TFunction): RowFilter<BootableVolume> => ({
  filter: (filters, obj) => isEmpty(filters?.selected?.length) || isBootableVolumeISO(obj),
  filterGroupName: t('Type'),
  items: [
    {
      id: ISO,
      title: ISO,
    },
  ],
  reducer: (obj) => isBootableVolumeISO(obj) && ISO,
  type: ISO,
});

const getBootVolumeFilters = (
  bootableVolumes: BootableVolume[],
  t: TFunction,
): RowFilter<BootableVolume>[] => [
  getDeprecatedBootVolumeFilter(t),
  getArchitectureBootVolumeFilter(bootableVolumes, t),
  getOperatingSystemBootVolumeFilter(t),
  getResourceKindBootVolumeFilter(t),
  getIsoBootVolumeFilter(t),
];

export const getBootVolumeTableFilters = (
  bootableVolumes: BootableVolume[],
  preferenceName: string | undefined,
  t: TFunction,
): RowFilter<BootableVolume>[] => {
  const filters = getBootVolumeFilters(bootableVolumes, t);
  const shouldIncludeOsFilter = !preferenceName || isLinuxGenericPreference(preferenceName);

  if (shouldIncludeOsFilter) {
    return filters;
  }

  return filters.filter((filter) => filter.type !== OS_NAME_FILTER_TYPE);
};

export default getBootVolumeFilters;
