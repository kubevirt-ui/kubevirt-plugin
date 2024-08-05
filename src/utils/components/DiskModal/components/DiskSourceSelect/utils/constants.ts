import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { DiskSourceOptionGroup, DiskSourceOptionGroupItem } from './types';

export const diskSourceSnapshotVolumeNameFieldID = 'snapshot-name-select';
export const diskSourceSnapshotVolumeNamespaceFieldID = 'snapshot-project-select';
export const diskSourcePVCNameFieldID = 'pvc-name-select';
export const diskSourcePVCNamespaceFieldID = 'pvc-project-select';
export const diskSourceUploadFieldID = 'disk-source-upload';
export const diskSourceURLFieldID = 'disk-source-url';
export const ephemeralDiskSizeFieldID = 'ephemeral-disk-size';
export const diskSourceFieldID = 'disk-source';
export const diskSourceEphemeralFieldID = 'disk-source-container';

export const optionLabelMapper: { [key in SourceTypes]: string } = {
  [SourceTypes.BLANK]: t('Empty disk (blank)'),
  [SourceTypes.CLONE_PVC]: t('Clone volume'),
  [SourceTypes.DATA_SOURCE]: t('Use DataSource'),
  [SourceTypes.EPHEMERAL]: t('Ephemeral disk (Container image)'),
  [SourceTypes.HTTP]: t('From URL'),
  [SourceTypes.OTHER]: t('Other'),
  [SourceTypes.PVC]: t('Volume'),
  [SourceTypes.REGISTRY]: t('From Registry'),
  [SourceTypes.UPLOAD]: t('Upload'),
  [SourceTypes.VOLUME_SNAPSHOT]: t('Volume snapshot'),
};

export const attachExistingGroupOptions: DiskSourceOptionGroup = {
  groupLabel: t('Use existing'),
  items: [
    {
      description: t('Any changes are lost upon reboot'),
      id: SourceTypes.EPHEMERAL,
      label: optionLabelMapper[SourceTypes.EPHEMERAL],
    },
    {
      description: t('Add a volume already available on the cluster.'),
      id: SourceTypes.PVC,
      label: optionLabelMapper[SourceTypes.PVC],
    },
    {
      description: t('Add a snapshot available on the cluster to the VirtualMachine.'),
      id: SourceTypes.VOLUME_SNAPSHOT,
      label: optionLabelMapper[SourceTypes.VOLUME_SNAPSHOT],
    },
    {
      description: t('Clone a volume available on the cluster and add it to the VirtualMachine. '),
      id: SourceTypes.CLONE_PVC,
      label: optionLabelMapper[SourceTypes.CLONE_PVC],
    },
  ],
};

export const blankOption: DiskSourceOptionGroupItem = {
  description: t('Create a disk with no contents.'),
  id: SourceTypes.BLANK,
  label: optionLabelMapper[SourceTypes.BLANK],
};
