import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

import DiskSourceClonePVCSelect from '../components/DiskSourceClonePVCSelect/DiskSourceClonePVCSelect';
import DiskSourceContainer from '../components/DiskSourceContainer/DiskSourceContainer';
import DiskSourcePVCSelect from '../components/DiskSourcePVCSelect/DiskSourcePVCSelect';
import DiskSourceUploadPVC from '../components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import DiskSourceUrlInput from '../components/DiskSourceUrlInput/DiskSourceUrlInput';

import {
  attachExistingGroupOptions,
  blankOption,
  clonePVCOption,
  ephemeralField,
  optionLabelMapper,
  registeryField,
} from './constants';
import { DiskSourceOptionGroup } from './types';

export const getSelectedDiskSourceComponent = (
  vm: V1VirtualMachine,
  relevantUpload: DataUpload,
) => {
  const os = getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);
  return {
    [SourceTypes.BLANK]: null,
    [SourceTypes.CLONE_PVC]: <DiskSourceClonePVCSelect />,
    [SourceTypes.EPHEMERAL]: <DiskSourceContainer fieldName={ephemeralField} os={os} />,
    [SourceTypes.HTTP]: (
      <DiskSourceUrlInput os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]} />
    ),
    [SourceTypes.PVC]: (
      <DiskSourcePVCSelect
        vmNamepace={vm?.metadata?.namespace} // we allow to use only PVCs from the same namespace of the VM
      />
    ),
    [SourceTypes.REGISTRY]: <DiskSourceContainer fieldName={registeryField} os={os} />,
    [SourceTypes.UPLOAD]: <DiskSourceUploadPVC relevantUpload={relevantUpload} />,
  };
};

export const getImportGroupOptions = (isTemplate: boolean): DiskSourceOptionGroup => ({
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
    !isTemplate && {
      id: SourceTypes.UPLOAD,
      label: optionLabelMapper[SourceTypes.UPLOAD],
    },
  ],
});

export const getDiskSourceOptionGroups = (isTemplate: boolean): DiskSourceOptionGroup[] => [
  attachExistingGroupOptions,
  clonePVCOption,
  blankOption,
  getImportGroupOptions(isTemplate),
];
