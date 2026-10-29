import type { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import type { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  ISO,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES,
} from '@kubevirt-utils/resources/bootableresources/constants';
import {
  isBootableVolumeISO,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_TITLE,
  getArchitecture,
  getUniqueArchitectures,
} from '@kubevirt-utils/utils/architecture';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { type BootVolumeTableRow } from '@virtualmachines/wizard/utils/types';

import { OS_NAME_FILTER_TYPE, RESOURCE_KIND_FILTER_TYPE, VARIANT_FILTER_TYPE } from './constants';
import { getBootVolumeOS, getPreferenceOptionVariant, isLinuxGenericPreference } from './utils';

const getDeprecatedFilter = (t: TFunction): KubevirtFilter<BootVolumeTableRow> => ({
  applyWhenEmpty: true,
  hideCountBadge: true,
  id: SHOW_DEPRECATED_BOOTABLE_VOLUMES,
  match: (row, selected) => (selected.length === 0 ? !isDeprecated(getName(row.volume)) : true),
  options: [{ label: t('Show deprecated bootable volumes'), value: 'true' }],
});

const getVariantFilter = (
  availablePreferences: PreferenceOption[],
  t: TFunction,
): KubevirtFilter<BootVolumeTableRow> => ({
  categoryLabel: t('Variant'),
  id: VARIANT_FILTER_TYPE,
  match: (row, selected) => selected.includes(row.preferenceVariant.name),
  options: availablePreferences.map((pref) => {
    const variant = getPreferenceOptionVariant(pref);
    return {
      label: variant === 'default' ? t('Default') : variant,
      value: pref.name,
    };
  }),
});

const getArchitectureBootVolumeFilter = (
  tableRows: BootVolumeTableRow[],
  t: TFunction,
): KubevirtFilter<BootVolumeTableRow> => {
  const volumes = tableRows.map((row) => row.volume);
  const architectureOptions = getUniqueArchitectures(volumes).map((arch) => ({
    label: arch ?? t(OTHER),
    value: arch ?? OTHER,
  }));
  return {
    categoryLabel: ARCHITECTURE_TITLE,
    id: ARCHITECTURE_ID,
    match: (row, selected) => selected.includes(getArchitecture(row.volume) ?? OTHER),
    options: architectureOptions,
  };
};

const getOperatingSystemBootVolumeFilter = (t: TFunction): KubevirtFilter<BootVolumeTableRow> => ({
  categoryLabel: t('Operating system'),
  id: OS_NAME_FILTER_TYPE,
  match: (row) => OS_NAMES.some((osName) => osName.id === getBootVolumeOS(row.volume)),
  options: OS_NAMES.map((osName) => ({ label: osName.title, value: osName.id })),
});

const getResourceKindBootVolumeFilter = (t: TFunction): KubevirtFilter<BootVolumeTableRow> => ({
  categoryLabel: t('Resource'),
  id: RESOURCE_KIND_FILTER_TYPE,
  match: (row, selected) => selected.includes(row.volume?.kind),
  options: [{ label: 'DS', value: DataSourceModel.kind }],
});

const getIsoBootVolumeFilter = (t: TFunction): KubevirtFilter<BootVolumeTableRow> => ({
  categoryLabel: t('Type'),
  id: ISO,
  match: (row) => isBootableVolumeISO(row.volume),
  options: [{ label: ISO, value: ISO }],
});

const getBootVolumeFilters = (
  tableRows: BootVolumeTableRow[],
  guestOperatingSystem: PreferenceOption | undefined,
  t: TFunction,
): KubevirtFilter<BootVolumeTableRow>[] => {
  const availablePreferences = guestOperatingSystem?.availablePreferences;

  return [
    getDeprecatedFilter(t),
    availablePreferences
      ? getVariantFilter(availablePreferences, t)
      : getArchitectureBootVolumeFilter(tableRows, t),
    getOperatingSystemBootVolumeFilter(t),
    getResourceKindBootVolumeFilter(t),
    getIsoBootVolumeFilter(t),
  ];
};

export const getBootVolumeTableFilters = (
  tableRows: BootVolumeTableRow[],
  guestOperatingSystem: PreferenceOption | undefined,
  t: TFunction,
): KubevirtFilter<BootVolumeTableRow>[] => {
  const filters = getBootVolumeFilters(tableRows, guestOperatingSystem, t);
  const preferenceName = guestOperatingSystem?.name;
  const shouldIncludeOsFilter = !preferenceName || isLinuxGenericPreference(preferenceName);

  if (shouldIncludeOsFilter) {
    return filters;
  }

  return filters.filter((filter) => filter.id !== OS_NAME_FILTER_TYPE);
};

export default getBootVolumeTableFilters;
