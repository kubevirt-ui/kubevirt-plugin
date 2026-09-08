import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getIconClass } from '@kubevirt-utils/resources/shared';
import {
  getTemplateOSAnnotation,
  isValidTemplateIconUrl,
  type OS_NAME_TYPES,
  type Template,
} from '@kubevirt-utils/resources/template';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

import bsd from './svg/bsd.svg';
import centos from './svg/centos.svg';
import debian from './svg/debian.svg';
import fedora from './svg/fedora.svg';
import linux from './svg/linux.svg';
import opensuse from './svg/opensuse.svg';
import rhel from './svg/rhel.svg';
import ubuntu from './svg/ubuntu.svg';
import windows from './svg/windows.svg';

const iconMap: Record<string, string> = {
  'icon-bsd': bsd,
  'icon-centos': centos,
  'icon-debian': debian,
  'icon-fedora': fedora,
  'icon-linux': linux,
  'icon-opensuse': opensuse,
  'icon-other': linux,
  'icon-rhel': rhel,
  'icon-ubuntu': ubuntu,
  'icon-windows': windows,
};

const ICON_OTHER = iconMap['icon-other'];

/**
 * Get the icon from the operating system shortcut.
 * Example shortcuts: "rhel8", "centos-stream9", "windows2k16"
 */
const getOSIconFromOSShortcut = (osShortcut: string): string | undefined => {
  if (osShortcut.startsWith(OS_WINDOWS_PREFIX)) {
    return iconMap['icon-windows'];
  }
  const icon = 'icon-'.concat(osShortcut.replace(/\d/, '').split('-')[0]);
  return iconMap[icon];
};

export const getTemplateOSIcon = (
  template: Template,
  clusterPreference?: null | V1beta1VirtualMachineClusterPreference,
): string => {
  const icon =
    getIconClass(template) ??
    (clusterPreference ? getIconClass(clusterPreference as K8sResourceCommon) : undefined);

  if (!icon) {
    const osAnnotation = getTemplateOSAnnotation(template);
    return (osAnnotation && getOSIconFromOSShortcut(osAnnotation)) ?? ICON_OTHER;
  }

  if (isValidTemplateIconUrl(icon)) {
    return icon;
  }
  return iconMap[icon] ?? ICON_OTHER;
};

export const getBootableVolumeOSIcon = (
  clusterPreference?: null | V1beta1VirtualMachineClusterPreference,
  volumeName?: string,
): string => {
  const icon = getIconClass(clusterPreference as K8sResourceCommon);

  if (icon) {
    if (isValidTemplateIconUrl(icon)) return icon;
    if (iconMap[icon]) return iconMap[icon] ?? ICON_OTHER;
  }

  if (volumeName) {
    return getOSIconFromOSShortcut(volumeName) ?? ICON_OTHER;
  }

  return ICON_OTHER;
};

export const getIconByOSName = (osName: OS_NAME_TYPES | string): string =>
  iconMap['icon-'.concat(osName)];
