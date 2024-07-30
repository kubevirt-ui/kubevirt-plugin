import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  attachExistingGroupOptions,
  blankOption,
  clonePVCOption,
  optionLabelMapper,
} from './constants';
import { DiskSourceOptionGroup } from './types';

export const getImportGroupOptions = (isTemplate: boolean): DiskSourceOptionGroup => ({
  description: t('URL, Registry or Upload'),
  groupLabel: t('Import'),
  items: [
    {
      description: t('HTTP or HTTPS endpoint.'),
      id: SourceTypes.HTTP,
      label: optionLabelMapper[SourceTypes.HTTP],
    },
    {
      description: t('Content from container registry.'),
      id: SourceTypes.REGISTRY,
      label: optionLabelMapper[SourceTypes.REGISTRY],
    },
    ...(isTemplate
      ? []
      : [
          {
            id: SourceTypes.UPLOAD,
            label: optionLabelMapper[SourceTypes.UPLOAD],
          },
        ]),
  ],
});

export const getDiskSourceOptionGroups = (isTemplate: boolean): DiskSourceOptionGroup[] => [
  attachExistingGroupOptions,
  clonePVCOption,
  blankOption,
  getImportGroupOptions(isTemplate),
];
