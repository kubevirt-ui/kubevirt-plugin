import { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  ISO,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES,
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

import { OS_NAME_FILTER_TYPE, RESOURCE_KIND_FILTER_TYPE } from './constants';
import { getBootVolumeOS, isLinuxGenericPreference } from './utils';

const getDeprecatedBootVolumeFilter = (t: TFunction): KubevirtFilter<BootableVolume> => ({
  applyWhenEmpty: true,
  hideCountBadge: true,
  id: SHOW_DEPRECATED_BOOTABLE_VOLUMES,
  match: (obj, selected) => (selected.length === 0 ? !isDeprecated(getName(obj)) : true),
  options: [{ label: t('Show deprecated bootable volumes'), value: 'true' }],
});

const getArchitectureBootVolumeFilter = (
  bootableVolumes: BootableVolume[],
  t: TFunction,
): KubevirtFilter<BootableVolume> => {
  const architectureOptions = getUniqueArchitectures(bootableVolumes).map((arch) => ({
    value: arch ?? OTHER,
    label: arch ?? t(OTHER),
  }));

  return {
    categoryLabel: ARCHITECTURE_TITLE,
    id: ARCHITECTURE_ID,
    match: (obj, selected) => selected.includes(getArchitecture(obj) ?? OTHER),
    options: architectureOptions,
  };
};

const getOperatingSystemBootVolumeFilter = (t: TFunction): KubevirtFilter<BootableVolume> => ({
  categoryLabel: t('Operating system'),
  id: OS_NAME_FILTER_TYPE,
  match: (obj, selected) => selected.includes(getBootVolumeOS(obj)),
  options: OS_NAMES.map((osName) => ({ label: osName.title, value: osName.id })),
});

const getResourceKindBootVolumeFilter = (t: TFunction): KubevirtFilter<BootableVolume> => ({
  categoryLabel: t('Resource'),
  id: RESOURCE_KIND_FILTER_TYPE,
  match: (obj, selected) => selected.includes(obj?.kind),
  options: [{ label: 'DS', value: DataSourceModel.kind }],
});

const getIsoBootVolumeFilter = (t: TFunction): KubevirtFilter<BootableVolume> => ({
  categoryLabel: t('Type'),
  id: ISO,
  match: (obj) => isBootableVolumeISO(obj),
  options: [{ label: ISO, value: ISO }],
});

const getBootVolumeFilters = (
  bootableVolumes: BootableVolume[],
  t: TFunction,
): KubevirtFilter<BootableVolume>[] => [
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
): KubevirtFilter<BootableVolume>[] => {
  const filters = getBootVolumeFilters(bootableVolumes, t);
  const shouldIncludeOsFilter = !preferenceName || isLinuxGenericPreference(preferenceName);

  if (shouldIncludeOsFilter) {
    return filters;
  }

  return filters.filter((filter) => filter.id !== OS_NAME_FILTER_TYPE);
};

export default getBootVolumeTableFilters;
