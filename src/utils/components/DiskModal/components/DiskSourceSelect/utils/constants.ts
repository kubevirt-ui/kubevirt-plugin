import { TFunction } from 'react-i18next';

import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

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
export const diskSourceUsernameFieldID = 'disk-source-username';
export const diskSourcePasswordFieldID = 'disk-source-password';

export const optionLabelMapper: { [key in SourceTypes]: string } = {
  [SourceTypes.BLANK]: 'Empty disk (blank)',
  [SourceTypes.CDROM]: 'CD-ROM',
  [SourceTypes.CLONE_PVC]: 'Clone volume',
  [SourceTypes.DATA_SOURCE]: 'Use DataSource',
  [SourceTypes.EPHEMERAL]: 'Ephemeral disk (Container image)',
  [SourceTypes.HTTP]: 'From URL',
  [SourceTypes.OTHER]: 'Other',
  [SourceTypes.PVC]: 'Volume',
  [SourceTypes.REGISTRY]: 'From Registry',
  [SourceTypes.UPLOAD]: 'Upload',
  [SourceTypes.VOLUME_SNAPSHOT]: 'Volume snapshot',
};

export const getAttachExistingGroupOptions = (t: TFunction): DiskSourceOptionGroup => {
  return {
    groupLabel: t('Use existing'),
    items: [
      {
        description: t('Any changes are lost upon reboot'),
        id: SourceTypes.EPHEMERAL,
        label: t(optionLabelMapper[SourceTypes.EPHEMERAL]),
      },
      {
        description: t('Add a volume already available on the cluster.'),
        id: SourceTypes.PVC,
        label: t(optionLabelMapper[SourceTypes.PVC]),
      },
      {
        description: t('Add a snapshot available on the cluster to the VirtualMachine.'),
        id: SourceTypes.VOLUME_SNAPSHOT,
        label: t(optionLabelMapper[SourceTypes.VOLUME_SNAPSHOT]),
      },
      {
        description: t(
          'Clone a volume available on the cluster and add it to the VirtualMachine. ',
        ),
        id: SourceTypes.CLONE_PVC,
        label: t(optionLabelMapper[SourceTypes.CLONE_PVC]),
      },
    ],
  };
};

export const getBlankOption = (t: TFunction): DiskSourceOptionGroupItem => {
  return {
    description: t('Create a disk with no contents.'),
    id: SourceTypes.BLANK,
    label: t(optionLabelMapper[SourceTypes.BLANK]),
  };
};

export const getCDROMOption = (t: TFunction): DiskSourceOptionGroupItem => {
  return {
    description: t('Add a CD-ROM to the VirtualMachine configuration'),
    id: SourceTypes.CDROM,
    label: t(optionLabelMapper[SourceTypes.CDROM]),
  };
};
