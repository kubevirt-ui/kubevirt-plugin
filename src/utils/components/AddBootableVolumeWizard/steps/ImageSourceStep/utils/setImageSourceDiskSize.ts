import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { isIsoFile, isIsoFilename } from '@kubevirt-utils/resources/bootableresources/isoHelpers';

import type { BootableVolumeWizardFormValues } from '../../../form/types';
import { wizardSetValueOptions } from '../../../form/wizardSetValueOptions';

export const setImageSourceDiskSize = (
  getValues: UseFormGetValues<BootableVolumeWizardFormValues>,
  setValue: UseFormSetValue<BootableVolumeWizardFormValues>,
  newSize?: string,
): void => {
  const nextSize = newSize ?? '';

  if (getValues('imageSource.diskSize') === nextSize) {
    return;
  }

  setValue('imageSource.diskSize', nextSize, wizardSetValueOptions);
};

export const setImageSourceIsoFromFilename = (
  setValue: UseFormSetValue<BootableVolumeWizardFormValues>,
  fileName?: null | string,
): void => {
  setValue('imageSource.isIso', isIsoFilename(fileName), wizardSetValueOptions);
};

export const setImageSourceIsoFromPath = (
  setValue: UseFormSetValue<BootableVolumeWizardFormValues>,
  pathOrUrl?: null | string,
): void => {
  setValue('imageSource.isIso', isIsoFile(pathOrUrl), wizardSetValueOptions);
};
