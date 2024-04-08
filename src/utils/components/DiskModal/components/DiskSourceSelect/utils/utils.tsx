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

import { ephemeralField, registeryField } from './constants';

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

type ExcludeOther = Exclude<SourceTypes, SourceTypes.OTHER | SourceTypes.UPLOAD>;

export const getDiskSourceOptions = (
  isTemplate: boolean,
): Record<ExcludeOther, { description: string; label: string }> => ({
  [SourceTypes.BLANK]: {
    description: t('Create an empty disk.'),
    label: t('Blank (creates PVC)'),
  },
  [SourceTypes.CLONE_PVC]: {
    description: t(
      'Select an existing persistent volume claim already available on the cluster and clone it.',
    ),
    label: t('PVC (creates PVC)'),
  },
  [SourceTypes.EPHEMERAL]: {
    description: t(
      'Upload content from a container located in a registry accessible from the cluster. The container disk is meant to be used only for read-only filesystems such as CD-ROMs or for small short-lived throw-away VMs.',
    ),
    label: t('Container (ephemeral)'),
  },
  [SourceTypes.HTTP]: {
    description: t('Import content via URL (HTTP or HTTPS endpoint).'),
    label: t('URL (creates PVC)'),
  },
  [SourceTypes.PVC]: {
    description: t('Use a persistent volume claim (PVC) already available on the cluster.'),
    label: t('Use an existing PVC'),
  },
  [SourceTypes.REGISTRY]: {
    description: t('Import content via container registry.'),
    label: t('Registry (creates PVC)'),
  },
  ...(!isTemplate
    ? {
        [SourceTypes.UPLOAD]: {
          description: t('Upload a new file to PVC. a new PVC will be created.'),
          label: t('Upload (Upload a new file to PVC)'),
        },
      }
    : {}),
});
