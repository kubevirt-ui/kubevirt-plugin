import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { DiskSourceOptionGroup } from './types';

export const diskSourcePVCNameFieldID = 'pvc-name-select';
export const diskSourcePVCNamespaceFieldID = 'pvc-project-select';
export const diskSourceUploadFieldID = 'disk-source-upload';
export const diskSourceURLFieldID = 'disk-source-url';
export const ephemeralDiskSizeFieldID = 'ephemeral-disk-size';
export const diskSourceFieldID = 'disk-source';
export const diskSourceEphemeralFieldID = 'disk-source-container';

export const clonePVCNameField = 'pvc.pvcName';
export const clonePVCNamespaceField = 'pvc.pvcNamespace';
export const ephemeralField = 'containerDisk.url';
export const registeryField = 'registry.url';
export const pvcNameField = 'persistentVolumeClaim.pvcName';
export const uploadFilenameField = 'upload.uploadFilename';
export const uploadFileField = 'upload.uploadFile';
export const urlField = 'http.url';

export const optionLabelMapper: { [key in SourceTypes]: string } = {
  [SourceTypes.BLANK]: t('Empty disk (blank)'),
  [SourceTypes.CLONE_PVC]: t('Clone existing PVC'),
  [SourceTypes.EPHEMERAL]: t('Ephemeral disk (Container image)'),
  [SourceTypes.HTTP]: t('From URL'),
  [SourceTypes.OTHER]: t('Other'),
  [SourceTypes.PVC]: t('PVC'),
  [SourceTypes.REGISTRY]: t('From Registry'),
  [SourceTypes.UPLOAD]: t('Upload'),
};

export const attachExistingGroupOptions: DiskSourceOptionGroup = {
  description: t('Container image or PVC'),
  groupLabel: t('Attach existing'),
  items: [
    {
      description: t('Use only for read-only file systems and short-lived VMs.'),
      id: SourceTypes.EPHEMERAL,
      label: optionLabelMapper[SourceTypes.EPHEMERAL],
    },
    {
      description: t('Use a persistent volume claim available on the cluster.'),
      id: SourceTypes.PVC,
      label: optionLabelMapper[SourceTypes.PVC],
    },
  ],
};

export const clonePVCOption: DiskSourceOptionGroup = {
  items: [
    {
      description: t('Copy persistent volume claim available on the cluster.'),
      id: SourceTypes.CLONE_PVC,
      label: optionLabelMapper[SourceTypes.CLONE_PVC],
    },
  ],
};

export const blankOption: DiskSourceOptionGroup = {
  items: [
    {
      description: t('Create a disk with no contents.'),
      id: SourceTypes.BLANK,
      label: optionLabelMapper[SourceTypes.BLANK],
    },
  ],
};
