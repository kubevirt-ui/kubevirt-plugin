import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getPreferenceVariantName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { type BootVolumeTableRow } from '@virtualmachines/wizard/utils/types';

const ARCHITECTURE_VARIANTS = new Set(['amd64', 'arm64', 's390x']);

export const getPreferenceOptionVariant = (preference: PreferenceOption): string => {
  const explicitVariant = getPreferenceVariantName(preference.name);
  return explicitVariant ?? preference.architecture ?? 'default';
};

export const getPreferenceOptionKey = (preference: PreferenceOption): string =>
  `${preference.kind ?? VirtualMachineClusterPreferenceModel.kind}/${preference.name}`;

const createTableRowKey = (volume: BootableVolume, preference: PreferenceOption): string =>
  `${getNamespace(volume)}/${getName(volume)}/${getPreferenceOptionKey(preference)}`;

const isPreferenceCompatibleWithVolume = (
  volume: BootableVolume,
  preference: PreferenceOption,
): boolean => {
  const explicitVariant = getPreferenceVariantName(preference.name);
  const preferenceArchitecture =
    preference.architecture ??
    (explicitVariant && ARCHITECTURE_VARIANTS.has(explicitVariant) ? explicitVariant : undefined);
  const volumeArch = getArchitecture(volume);

  return !preferenceArchitecture || !volumeArch || volumeArch === preferenceArchitecture;
};

const toPreferenceVariantRef = (preference: PreferenceOption): PreferenceOption => ({
  kind: preference.kind,
  name: preference.name,
});

const createTableRow = (
  volume: BootableVolume,
  preference: PreferenceOption,
): BootVolumeTableRow => {
  const preferenceVariant = toPreferenceVariantRef(preference);

  return {
    metadata: volume.metadata,
    preferenceVariant,
    rowKey: createTableRowKey(volume, preferenceVariant),
    variant: getPreferenceOptionVariant(preference),
    volume,
  };
};

const createDefaultTableRow = (volume: BootableVolume): BootVolumeTableRow => {
  const preferenceName = getLabel(volume, DEFAULT_PREFERENCE_LABEL) ?? '';
  const preferenceKind =
    getLabel(volume, DEFAULT_PREFERENCE_KIND_LABEL) ?? VirtualMachineClusterPreferenceModel.kind;
  return createTableRow(volume, { kind: preferenceKind, name: preferenceName });
};

const appendCompatibleRows = (
  rows: BootVolumeTableRow[],
  volume: BootableVolume,
  preferences: PreferenceOption[],
): BootVolumeTableRow[] =>
  preferences.reduce((acc, pref) => {
    if (!isPreferenceCompatibleWithVolume(volume, pref)) return acc;
    acc.push(createTableRow(volume, pref));
    return acc;
  }, rows);

export const expandVolumesToTableRows = (
  volumes: BootableVolume[],
  guestOperatingSystem: PreferenceOption | undefined,
): BootVolumeTableRow[] => {
  const availablePreferences = guestOperatingSystem?.availablePreferences;

  if (!availablePreferences) {
    return volumes.map(createDefaultTableRow);
  }

  return volumes.reduce<BootVolumeTableRow[]>(
    (rows, volume) => appendCompatibleRows(rows, volume, availablePreferences),
    [],
  );
};

export const isSameTableRow = (
  selectedRow: BootVolumeTableRow | undefined,
  row: BootVolumeTableRow,
): boolean => selectedRow?.rowKey === row.rowKey;

export const createTableRowFromSelection = (
  volume: BootableVolume | undefined,
  preference: PreferenceOption | undefined,
): BootVolumeTableRow | undefined => {
  if (!volume) return undefined;
  if (!preference) return createDefaultTableRow(volume);
  return createTableRow(volume, preference);
};
