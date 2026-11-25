import type { TFunction } from 'i18next';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';

import { BootableVolumeWizardStep } from '../../../form/stepValidation';
import type {
  BootableVolumeWizardFormValues,
  BootableVolumeWizardImageSourceValues,
} from '../../../form/types';
import { getOperatingSystemLabel } from '../../../utils/constants';
import { getSourceOptionLabel } from '../../ImageSourceStep/utils/sourceOptions';

export type ReviewRow = {
  isOptional?: boolean;
  label: string;
  stepId: BootableVolumeWizardStep;
  value?: string;
};

const formatNamespacedName = (project?: string, name?: string): string | undefined => {
  if (!project?.trim() || !name?.trim()) {
    return undefined;
  }

  return `${project}/${name}`;
};

const sourceSpecificReviewRowsByType: Record<
  DROPDOWN_FORM_SELECTION,
  (imageSource: BootableVolumeWizardImageSourceValues, t: TFunction) => ReviewRow[]
> = {
  [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: (imageSource, t) => [
    {
      label: t('Upload file'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: imageSource.upload.filename,
    },
  ],
  [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: (imageSource, t) => [
    {
      label: t('Existing volume'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: formatNamespacedName(
        imageSource.existingVolume.project,
        imageSource.existingVolume.name,
      ),
    },
  ],
  [DROPDOWN_FORM_SELECTION.USE_HTTP]: (imageSource, t) => [
    {
      label: t('URL'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: imageSource.url.imageUrl,
    },
  ],
  [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: (imageSource, t) => [
    {
      label: t('Registry image'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: imageSource.registry.image,
    },
  ],
  [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: (imageSource, t) => [
    {
      label: t('Existing snapshot'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: formatNamespacedName(
        imageSource.existingSnapshot.project,
        imageSource.existingSnapshot.name,
      ),
    },
  ],
};

const getSourceSpecificReviewRows = (
  imageSource: BootableVolumeWizardImageSourceValues,
  t: TFunction,
): ReviewRow[] => sourceSpecificReviewRowsByType[imageSource.sourceType]?.(imageSource, t) ?? [];

export const getReviewRows = (
  values: BootableVolumeWizardFormValues,
  t: TFunction,
): ReviewRow[] => {
  const { imageSource, operatingSystem, projectAndVolume } = values;
  const preferenceLabel = operatingSystem.labels?.[DEFAULT_PREFERENCE_LABEL];
  const instanceTypeLabel = operatingSystem.labels?.[DEFAULT_INSTANCETYPE_LABEL];

  return [
    {
      label: t('Volume name'),
      stepId: BootableVolumeWizardStep.PROJECT_AND_VOLUME,
      value: projectAndVolume.volumeName,
    },
    {
      label: t('Destination project'),
      stepId: BootableVolumeWizardStep.PROJECT_AND_VOLUME,
      value: projectAndVolume.destinationProject,
    },
    {
      label: t('Source type'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: getSourceOptionLabel(t, imageSource.sourceType),
    },
    ...getSourceSpecificReviewRows(imageSource, t),
    {
      label: t('Disk size'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: imageSource.diskSize,
    },
    {
      isOptional: true,
      label: t('Storage class'),
      stepId: BootableVolumeWizardStep.IMAGE_SOURCE,
      value: imageSource.storageClassName,
    },
    {
      label: getOperatingSystemLabel(t),
      stepId: BootableVolumeWizardStep.OPERATING_SYSTEM,
      value: preferenceLabel?.trim() ? preferenceLabel : operatingSystem.operatingSystem,
    },
    {
      isOptional: true,
      label: t('Default InstanceType'),
      stepId: BootableVolumeWizardStep.OPERATING_SYSTEM,
      value: instanceTypeLabel?.trim() ? instanceTypeLabel : operatingSystem.defaultInstanceType,
    },
  ];
};

export const areRequiredReviewFieldsComplete = (
  values: BootableVolumeWizardFormValues,
  t: TFunction,
): boolean => getReviewRows(values, t).every((row) => row.isOptional || Boolean(row.value?.trim()));
