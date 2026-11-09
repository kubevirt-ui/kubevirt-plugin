import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';

import { getPreferenceVersionName } from './preferenceNameUtils';

type GuestOperatingSystemSelection = {
  nextGuestOperatingSystem: PreferenceOption | null;
  shouldResetBootSource: boolean;
};

const isSamePreference = (first: PreferenceOption, second: PreferenceOption): boolean =>
  first.name === second.name && (!first.kind || !second.kind || first.kind === second.kind);

const findGuestOperatingSystem = (
  preferences: PreferenceOption[],
  version: string,
): PreferenceOption | null =>
  preferences.find((preference) => getPreferenceVersionName(preference.name) === version) ??
  preferences[0] ??
  null;

const includesPreference = (
  guestOperatingSystem: PreferenceOption | null,
  selectedPreference?: PreferenceOption | null,
): boolean =>
  !selectedPreference?.name ||
  guestOperatingSystem?.availablePreferences?.some((preference) =>
    isSamePreference(preference, selectedPreference),
  ) === true;

export const resolveGuestOSSelection = (
  preferences: PreferenceOption[],
  currentGuestOperatingSystem?: PreferenceOption | null,
  selectedPreference?: PreferenceOption | null,
): GuestOperatingSystemSelection => {
  const currentVersion = getPreferenceVersionName(currentGuestOperatingSystem?.name);
  const nextGuestOperatingSystem = findGuestOperatingSystem(preferences, currentVersion);
  const hasGuestOperatingSystemChanged =
    getPreferenceVersionName(nextGuestOperatingSystem?.name) !== currentVersion;

  return {
    nextGuestOperatingSystem,
    shouldResetBootSource:
      Boolean(currentGuestOperatingSystem) &&
      (hasGuestOperatingSystemChanged ||
        !includesPreference(nextGuestOperatingSystem, selectedPreference)),
  };
};
