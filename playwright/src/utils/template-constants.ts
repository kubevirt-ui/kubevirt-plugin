/**
 * Template constants and helper functions for Playwright tests.
 * Provides architecture-aware template metadata names and OS filter values.
 */

import { EnvVariables } from './env-variables';
import { getTemplateMetadataName as getArchAwareTemplateName } from './architecture';

export function getTemplateMetadataName(baseName: string, architecture?: string): string {
  if (architecture) {
    return getArchAwareTemplateName(baseName, architecture);
  }
  if (process.env.ARCH === 's390x' || EnvVariables.isS390x) {
    return getArchAwareTemplateName(baseName, 's390x');
  }
  return baseName;
}

/** Default QEMU machine type for the current cluster architecture. */
export function getDefaultMachineType(architecture?: string): string {
  const arch = architecture || process.env.ARCH;
  if (arch === 's390x' || (!arch && EnvVariables.isS390x)) {
    return 's390-ccw-virtio';
  }
  return 'pc-q35';
}

export const DEFAULT_MACHINE_TYPE = getDefaultMachineType();

/**
 * Architecture-aware template metadata names. Getters resolve at access time so
 * global setup / ARCH detection can run before tests read these values.
 */
export const TEMPLATE_METADATA_NAMES = {
  get RHEL7() {
    return getTemplateMetadataName('rhel7-server-small');
  },
  get RHEL8() {
    return getTemplateMetadataName('rhel8-server-small');
  },
  get RHEL9() {
    return getTemplateMetadataName('rhel9-server-small');
  },

  get CENTOS7() {
    return getTemplateMetadataName('centos7-server-small');
  },
  get CENTOSSTREAM8() {
    return getTemplateMetadataName('centos-stream8-server-small');
  },
  get CENTOSSTREAM9() {
    return getTemplateMetadataName('centos-stream9-server-small');
  },

  get FEDORA() {
    return getTemplateMetadataName('fedora-server-small');
  },

  // Windows templates (no architecture suffix)
  WIN10: 'windows10-desktop-medium',
  WIN11: 'windows11-desktop-medium',
  WIN2K12R2: 'windows2k12r2-server-medium',
  WIN2K16: 'windows2k16-server-medium',
  WIN2K19: 'windows2k19-server-medium',
  WIN2K22: 'windows2k22-server-medium',

  YAML: 'example',
} as const;

export const ALL_PROJECTS_NS = 'All Projects';

export const OS_FILTER_VALUES = {
  CENTOS: 'CentOS',
  FEDORA: 'Fedora',
  OTHER: 'Other',
  RHEL: 'RHEL',
  WINDOWS: 'Windows',
} as const;
