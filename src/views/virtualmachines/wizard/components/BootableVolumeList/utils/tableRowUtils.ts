import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getPreferenceVariantName,
  getPreferenceVersionName,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { type BootVolumeTableRow } from '@virtualmachines/wizard/utils/types';

export const getPreferenceOptionVariant = (preference: PreferenceOption): string => {
  const explicitVariant = getPreferenceVariantName(preference.name);
  return explicitVariant ?? preference.architecture ?? 'default';
};

const createTableRowKey = (volume: BootableVolume, preferenceName: string): string =>
  `${getNamespace(volume)}/${getName(volume)}/${preferenceName}`;

const volumeMatchesOSVersion = (volume: BootableVolume, osVersionName: string): boolean => {
  const volumePref = getLabel(volume, DEFAULT_PREFERENCE_LABEL);
  return !!volumePref && getPreferenceVersionName(volumePref) === osVersionName;
};

const createTableRow = (
  volume: BootableVolume,
  preferenceVariant: PreferenceOption,
): BootVolumeTableRow => ({
  metadata: volume.metadata,
  preferenceVariant,
  rowKey: createTableRowKey(volume, preferenceVariant.name),
  variant: getPreferenceOptionVariant(preferenceVariant),
  volume,
});

const createDefaultTableRow = (volume: BootableVolume): BootVolumeTableRow => {
  const preferenceName = getLabel(volume, DEFAULT_PREFERENCE_LABEL) ?? '';
  const preferenceKind =
    getLabel(volume, DEFAULT_PREFERENCE_KIND_LABEL) ?? VirtualMachineClusterPreferenceModel.kind;
  return createTableRow(volume, { kind: preferenceKind, name: preferenceName });
};

export const expandVolumesToTableRows = (
  volumes: BootableVolume[],
  guestOperatingSystem: PreferenceOption | undefined,
): BootVolumeTableRow[] => {
  const availablePreferences = guestOperatingSystem?.availablePreferences;

  if (!availablePreferences) {
    return volumes.map(createDefaultTableRow);
  }
  const osVersionName = getPreferenceVersionName(guestOperatingSystem.name);

  return volumes.reduce<BootVolumeTableRow[]>((rows, volume) => {
    if (volumeMatchesOSVersion(volume, osVersionName)) {
      for (const pref of availablePreferences) rows.push(createTableRow(volume, pref));
    }
    return rows;
  }, []);
};

export const isSameTableRow = (
  selectedRow: BootVolumeTableRow | undefined,
  row: BootVolumeTableRow,
): boolean => selectedRow?.rowKey === row.rowKey;

export const createTableRowFromSelection = (
  volume: BootableVolume | undefined,
  preference: PreferenceOption | undefined,
): BootVolumeTableRow | undefined => {
  if (!volume || !preference) return undefined;
  return createTableRow(volume, preference);
};
