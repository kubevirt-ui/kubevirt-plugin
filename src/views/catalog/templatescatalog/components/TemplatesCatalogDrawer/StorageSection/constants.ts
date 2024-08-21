import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
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
    bus: InterfaceTypes.SATA,
  },
  name: INSTALLATION_CDROM_NAME,
};
export const CUSTOMIZE_TEMPLATE_TITLE = t('Customize template parameters');

export const sourceOptions = {
  [BLANK_SOURCE_NAME]: {
    description: t('Create a new blank PVC'),
    label: t('Blank'),
    type: BLANK_SOURCE_NAME,
  },
  [CONTAINER_DISK_SOURCE_NAME]: {
    description: t('Import content via container registry.'),
    label: t('Registry (ContainerDisk)'),
    type: CONTAINER_DISK_SOURCE_NAME,
  },
  [DEFAULT_SOURCE]: {
    description: t('Use the default Template disk source'),
    label: t('Template default'),
    type: DEFAULT_SOURCE,
  },
  [HTTP_SOURCE_NAME]: {
    description: t('Import content via URL (HTTP or HTTPS endpoint).'),
    label: t('URL (creates PVC)'),
    type: HTTP_SOURCE_NAME,
  },
  [PVC_SOURCE_NAME]: {
    description: t(
      'Select an existing persistent volume claim already available on the cluster and clone it.',
    ),
    label: t('PVC (clone PVC)'),
    type: PVC_SOURCE_NAME,
  },
  [REGISTRY_SOURCE_NAME]: {
    description: t('Import content via container registry.'),
    label: t('Registry (creates PVC)'),
    type: REGISTRY_SOURCE_NAME,
  },
  [UPLOAD_SOURCE_NAME]: {
    description: t('Upload a new file to a PVC. A new PVC will be created.'),
    label: t('Upload (Upload a new file to a PVC)'),
    type: UPLOAD_SOURCE_NAME,
  },
};
