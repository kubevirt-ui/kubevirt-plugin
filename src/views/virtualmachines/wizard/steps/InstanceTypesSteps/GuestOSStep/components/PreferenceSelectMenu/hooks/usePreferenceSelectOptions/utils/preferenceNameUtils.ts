import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';

const PREFERENCE_VARIANT_SUFFIXES = [
  '.amd64',
  '.arm64',
  '.s390x',
  '.realtime',
  '.dpdk',
  '.desktop',
  '.virtio',
];

const VARIANT_NAMES_PATTERN = PREFERENCE_VARIANT_SUFFIXES.map((suffix) =>
  suffix.replace(/^\./, ''),
).join('|');

const GUEST_OS_DISPLAY_NAME_REGEX = new RegExp(`\\s*\\((?:${VARIANT_NAMES_PATTERN})\\)\\s*$`, 'i');

export const getPreferenceVersionName = (name?: string): string => {
  if (!name) return '';
  const matchingSuffix = PREFERENCE_VARIANT_SUFFIXES.find((suffix) => name.endsWith(suffix));
  return matchingSuffix ? name.slice(0, -matchingSuffix.length) : name;
};

export const getGuestOperatingSystemDisplayName = (displayName: string): string =>
  displayName.replace(GUEST_OS_DISPLAY_NAME_REGEX, '');

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
