import type { TFunction } from 'i18next';

import * as yup from '@kubevirt-utils/yup';

import type { BootableVolumeWizardFormValues } from '../types';

import { createImageSourceSchema } from './createImageSourceSchema';
import { createOperatingSystemSchema } from './createOperatingSystemSchema';
import { createProjectAndVolumeSchema } from './createProjectAndVolumeSchema';

export const createBootableVolumeWizardSchema = (
  t: TFunction,
): yup.ObjectSchema<BootableVolumeWizardFormValues> =>
  yup.object({
    imageSource: createImageSourceSchema(t),
    operatingSystem: createOperatingSystemSchema(),
    projectAndVolume: createProjectAndVolumeSchema(),
  }) as yup.ObjectSchema<BootableVolumeWizardFormValues>;
