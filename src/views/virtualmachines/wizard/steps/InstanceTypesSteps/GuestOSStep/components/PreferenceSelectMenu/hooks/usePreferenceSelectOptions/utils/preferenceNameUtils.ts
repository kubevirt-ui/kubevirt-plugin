import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';

export const PREFERENCE_VARIANT_SUFFIXES = [
  '.amd64',
  '.arm64',
  '.s390x',
  '.realtime',
  '.dpdk',
  '.desktop',
  '.virtio',
];

export const getPreferenceVersionName = (name: string): string => {
  const matchingSuffix = PREFERENCE_VARIANT_SUFFIXES.find((suffix) => name.endsWith(suffix));
  return matchingSuffix ? name.slice(0, -matchingSuffix.length) : name;
};

export const getGuestOperatingSystemDisplayName = (displayName: string): string =>
  displayName.replace(/\s*\((?:amd64|arm64|s390x|desktop|dpdk|realtime|virtio)\)\s*$/i, '');

export const getPreferenceVariantName = (name: string): string | undefined => {
  const versionName = getPreferenceVersionName(name);
  if (versionName === name) return undefined;
  return name.slice(versionName.length + 1);
};

export const getGuestOperatingSystemPreferences = (
  preferences: PreferenceOption[],
): PreferenceOption[] =>
  Object.values(
    preferences.reduce<
      Record<string, PreferenceOption & { availablePreferences: PreferenceOption[] }>
    >((groups, pref) => {
      const version = getPreferenceVersionName(pref.name);
      groups[version] = groups[version] ?? { ...pref, availablePreferences: [] };
      groups[version].availablePreferences.push(pref);
      return groups;
    }, {}),
  );
