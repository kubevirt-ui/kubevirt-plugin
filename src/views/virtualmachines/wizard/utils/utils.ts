import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { type TFunction } from 'i18next';

import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';
import { getDiskSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import CloneIcon from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/CloneIcon';
import { InstanceTypeIcon } from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/InstanceTypeIcon';
import TemplateIcon from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/components/CreationMethodTile/components/TemplateIcon';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import { type VMWizardFormValues } from '../form/types';
import {
  type ApplySelectedBootableVolumeToForm,
  type VMCreationMethodCardDetails,
  type VMCreationMethodConfig,
} from './types';

const VM_CREATION_METHOD_MAPPER: Record<VMCreationMethod, VMCreationMethodConfig> = {
  [VMCreationMethod.CLONE]: {
    cardDetails: (t) => ({
      description: t('Create a copy of an existing VirtualMachine.'),
      IconComponent: CloneIcon,
      label: t('Clone existing VirtualMachine'),
    }),
  },
  [VMCreationMethod.INSTANCE_TYPE]: {
    cardDetails: (t) => ({
      description: t(
        'Create a new VM by selecting an operating system and the right performance for your workload.',
      ),
      IconComponent: InstanceTypeIcon,
      label: t('Custom configuration (default)'),
    }),
  },
  [VMCreationMethod.TEMPLATE]: {
    cardDetails: (t) => ({
      description: t(
        'Create a pre-configured VM using standardized images. This option requires an existing template.',
      ),
      IconComponent: TemplateIcon,
      label: t('Create from Template'),
    }),
  },
};

export const getVMCreationMethodDetails = (
  creationMethod: VMCreationMethod,
  t: TFunction,
): VMCreationMethodCardDetails => VM_CREATION_METHOD_MAPPER[creationMethod].cardDetails(t);

export const isCloneCreationMethod = (creationMethod: VMCreationMethod): boolean =>
  creationMethod === VMCreationMethod.CLONE;
export const isTemplateCreationMethod = (creationMethod: VMCreationMethod): boolean =>
  creationMethod === VMCreationMethod.TEMPLATE;
export const isInstanceTypeCreationMethod = (creationMethod: VMCreationMethod): boolean =>
  creationMethod === VMCreationMethod.INSTANCE_TYPE;

export const applySelectedBootableVolumeToForm = ({
  dvSource,
  pvcSource,
  selectedVolume,
  setValue,
  volumeSnapshotSource,
}: ApplySelectedBootableVolumeToForm): void => {
  const name = getInstanceTypeFromVolume(selectedVolume) ?? '';
  const [series = '', size = ''] = name.split('.');

  setValue(
    'instanceType.bootVolume',
    {
      dataVolumeSource: dvSource,
      diskSize: getDiskSize(dvSource, pvcSource, volumeSnapshotSource),
      persistentVolumeClaimSource: pvcSource,
      volume: selectedVolume,
      volumeSnapshotSource,
    },
    { shouldValidate: true },
  );
  setValue('instanceType.compute', series && size ? { name, series, size, type: 'redhat' } : null, {
    shouldValidate: true,
  });
};

export const resetBootableVolumeFields = (setValue: UseFormSetValue<VMWizardFormValues>): void => {
  setValue('instanceType.bootVolume', null, { shouldValidate: true });
  setValue('instanceType.compute', null, { shouldValidate: true });
};

export const clearVMPendingUploads = (
  getValues: UseFormGetValues<VMWizardFormValues>,
  setValue: UseFormSetValue<VMWizardFormValues>,
): void => {
  const uploadKeys = getValues('customization.pendingBootableVolumeUploadKeys');
  setValue('customization.pendingBootableVolumeUploadKeys', []);
  cancelAllWizardPendingUploads(getValues('customization.vmDraft'), uploadKeys);
};
