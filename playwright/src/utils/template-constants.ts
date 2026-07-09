/**
 * Template constants and helper functions for Playwright tests.
 * Provides architecture-aware template metadata names and OS filter values.
 */

import { EnvVariables } from './env-variables';

export function getTemplateMetadataName(baseName: string, architecture?: string): string {
  const arch = architecture || process.env.ARCH;

  if (arch === 's390x' || (!arch && EnvVariables.isS390x)) {
    return `${baseName}-s390x`;
  }

  return baseName;
}

export const TEMPLATE_METADATA_NAMES = {
  // RHEL templates
  RHEL7: getTemplateMetadataName('rhel7-server-small'),
  RHEL8: getTemplateMetadataName('rhel8-server-small'),
  RHEL9: getTemplateMetadataName('rhel9-server-small'),

  // CentOS templates
  CENTOS7: getTemplateMetadataName('centos7-server-small'),
  CENTOSSTREAM8: getTemplateMetadataName('centos-stream8-server-small'),
  CENTOSSTREAM9: getTemplateMetadataName('centos-stream9-server-small'),

  // Fedora templates
  FEDORA: getTemplateMetadataName('fedora-server-small'),

  // Windows templates (no architecture suffix)
  WIN10: 'windows10-desktop-medium',
  WIN11: 'windows11-desktop-medium',
  WIN2K12R2: 'windows2k12r2-server-medium',
  WIN2K16: 'windows2k16-server-medium',
  WIN2K19: 'windows2k19-server-medium',
  WIN2K22: 'windows2k22-server-medium',

  // Default template
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
