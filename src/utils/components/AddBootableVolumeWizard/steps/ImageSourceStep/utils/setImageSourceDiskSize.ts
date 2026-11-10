import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import type { BootableVolumeWizardFormValues } from '../../../form/types';
import { imageSourceSetValueOptions } from './resetImageSourceFields';

export const setImageSourceDiskSize = (
  getValues: UseFormGetValues<BootableVolumeWizardFormValues>,
  setValue: UseFormSetValue<BootableVolumeWizardFormValues>,
  newSize?: string,
): void => {
  const nextSize = newSize ?? '';

  if (getValues('imageSource.diskSize') === nextSize) {
    return;
  }

  setValue('imageSource.diskSize', nextSize, imageSourceSetValueOptions);
};
