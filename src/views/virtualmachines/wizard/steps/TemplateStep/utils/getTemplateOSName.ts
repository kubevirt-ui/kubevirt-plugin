import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisplayName } from '@kubevirt-utils/resources/shared';
import {
  getTemplateOSAnnotation,
  type Template,
  WINDOWS,
} from '@kubevirt-utils/resources/template';
import {
  getOperatingSystemName,
  OS_WINDOWS_PREFIX,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

/**
 * Looks up a human-readable OS name from the map built by buildOSDisplayNameMap.
 *
 * Handles known convention mismatches between vm.kubevirt.io/os values
 * and name.os.template.kubevirt.io/* annotation keys:
 *  - Exact match: centos-stream9 → centos-stream9
 *  - Prefix match: rhel8 → rhel8.0 (OS key is a prefix of the template key)
 *  - Windows alias: windows2k16 → win2k16 (vm.kubevirt.io/os uses "windows" prefix,
 *    while OpenShift templates use "win" prefix)
 */
const lookupOSDisplayName = (osKey: string, map: Record<string, string>): string | undefined => {
  const newOSKey = osKey.startsWith(WINDOWS) ? osKey.replace(WINDOWS, OS_WINDOWS_PREFIX) : osKey;

  if (map[newOSKey]) return map[newOSKey];

  const prefixMatch = Object.keys(map).find((key) => key.startsWith(newOSKey));
  if (prefixMatch) return map[prefixMatch];

  return undefined;
};

export const getTemplateOSName = (
  template: Template,
  clusterPreference: null | V1beta1VirtualMachineClusterPreference,
  osDisplayNames?: Record<string, string>,
): string | undefined => {
  const osNameFromAnnotation = getOperatingSystemName(template);
  if (osNameFromAnnotation) return osNameFromAnnotation;

  const preferenceDisplayName = clusterPreference
    ? getDisplayName(clusterPreference as K8sResourceCommon)
    : undefined;
  if (preferenceDisplayName) return preferenceDisplayName;

  const osKey = getTemplateOSAnnotation(template);

  if (osKey && osDisplayNames) {
    const displayName = lookupOSDisplayName(osKey, osDisplayNames);
    if (displayName) return displayName;
  }

  return osKey;
};
