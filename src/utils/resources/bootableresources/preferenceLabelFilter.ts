import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const isLinuxGenericPreference = (preference: string): boolean => {
  const lower = preference.toLowerCase();
  return lower === 'linux' || lower.startsWith('linux.') || lower.startsWith('linux-');
};

export const getPreferenceOsType = (preferenceName: string): OS_NAME_TYPES =>
  Object.values(OS_NAME_TYPES).find((osName) => preferenceName.toLowerCase().includes(osName)) ??
  OS_NAME_TYPES.Other;

const preferenceNamesCompatible = (allowed: string, labeled: string): boolean => {
  if (allowed === labeled) {
    return true;
  }
  if (allowed.startsWith(`${labeled}.`) || allowed.startsWith(`${labeled}-`)) {
    return true;
  }
  if (labeled.startsWith(`${allowed}.`) || labeled.startsWith(`${allowed}-`)) {
    return true;
  }

  if (isLinuxGenericPreference(allowed)) {
    const labeledOs = getPreferenceOsType(labeled);
    return labeledOs !== OS_NAME_TYPES.Rhel && labeledOs !== OS_NAME_TYPES.Windows;
  }

  const allowedOs = getPreferenceOsType(allowed);
  const labeledOs = getPreferenceOsType(labeled);
  if (allowedOs !== OS_NAME_TYPES.Other && labeledOs !== OS_NAME_TYPES.Other) {
    return allowedOs === labeledOs;
  }

  return false;
};

/**
 * Keep resources with no preference label. When allowed preferences are set, hide
 * resources whose preference label is a different OS (e.g. fedora vs rhel.10).
 */
export const resourceMatchesAllowedPreferences = (
  resource: K8sResourceCommon,
  allowedPreferenceNames: string[] | undefined,
): boolean => {
  if (isEmpty(allowedPreferenceNames)) {
    return true;
  }

  const preferenceLabel = getLabel(resource, DEFAULT_PREFERENCE_LABEL);
  if (!preferenceLabel) {
    return true;
  }

  return allowedPreferenceNames.some((allowed) =>
    preferenceNamesCompatible(allowed, preferenceLabel),
  );
};

export const filterResourcesByAllowedPreferences = <T extends K8sResourceCommon>(
  resources: T[] | undefined,
  allowedPreferenceNames: string[] | undefined,
): T[] =>
  (resources ?? []).filter((resource) =>
    resourceMatchesAllowedPreferences(resource, allowedPreferenceNames),
  );
