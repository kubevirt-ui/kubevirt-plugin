import type { TFunction } from 'i18next';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';

export type SourceOption = {
  description: string;
  label: string;
  value: DROPDOWN_FORM_SELECTION;
};

export const getSourceOptions = (t: TFunction): SourceOption[] => [
  {
    description: t('Upload a file from your computer. ISO files are detected automatically.'),
    label: t('Upload'),
    value: DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
  },
  {
    description: t('Use a volume already available on the cluster.'),
    label: t('Use existing volume'),
    value: DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC,
  },
  {
    description: t('Use a snapshot of an existing volume.'),
    label: t('Use existing snapshot'),
    value: DROPDOWN_FORM_SELECTION.USE_SNAPSHOT,
  },
  {
    description: t('Content from a container registry.'),
    label: t('Import from registry'),
    value: DROPDOWN_FORM_SELECTION.USE_REGISTRY,
  },
  {
    description: t('Content from an HTTP or HTTPS URL. ISO files are detected automatically.'),
    label: t('Import from URL'),
    value: DROPDOWN_FORM_SELECTION.USE_HTTP,
  },
];

export const getSourceOptionLabel = (t: TFunction, sourceType: DROPDOWN_FORM_SELECTION): string => {
  const option = getSourceOptions(t).find(({ value }) => value === sourceType);
  return option?.label ?? t('Upload');
};
