import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const PVC_SOURCE_NAME = 'pvc-clone';
export const HTTP_SOURCE_NAME = 'http';
export const REGISTRY_SOURCE_NAME = 'registry';
export const DEFAULT_SOURCE = 'default';
export const BLANK_SOURCE_NAME = 'blank';
export const UPLOAD_SOURCE_NAME = 'upload';
export const CONTAINER_DISK_SOURCE_NAME = 'container-disk';
export const PVC_EPHEMERAL_SOURCE_NAME = 'pvc';

export type SOURCE_OPTIONS_IDS =
  | typeof BLANK_SOURCE_NAME
  | typeof CONTAINER_DISK_SOURCE_NAME
  | typeof DEFAULT_SOURCE
  | typeof HTTP_SOURCE_NAME
  | typeof PVC_EPHEMERAL_SOURCE_NAME
  | typeof PVC_SOURCE_NAME
  | typeof REGISTRY_SOURCE_NAME
  | typeof UPLOAD_SOURCE_NAME;

export const CD_SOURCES: SOURCE_OPTIONS_IDS[] = [
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  UPLOAD_SOURCE_NAME,
];

export const DISK_SOURCES_WITH_DEFAULT: SOURCE_OPTIONS_IDS[] = [
  DEFAULT_SOURCE,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  HTTP_SOURCE_NAME,
  UPLOAD_SOURCE_NAME,
  BLANK_SOURCE_NAME,
];

export const INSTALLATION_CDROM_NAME = 'installation-cdrom';

export const INSTALLATION_CDROM_DISK: V1Disk = {
  bootOrder: 1,
  cdrom: {
    bus: 'sata',
  },
  name: INSTALLATION_CDROM_NAME,
};
export const CUSTOMIZE_TEMPLATE_TITLE = t('Customize template parameters');
