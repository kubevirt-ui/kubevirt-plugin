import * as yup from '@kubevirt-utils/yup';

import type { BootableVolumeWizardOperatingSystemValues } from '../types';

import { optionalString, requiredString } from './shared/utils';

export const createOperatingSystemSchema =
  (): yup.ObjectSchema<BootableVolumeWizardOperatingSystemValues> =>
    yup.object({
      architecture: optionalString().defined(),
      architectures: yup.array().of(yup.string().defined()).defined(),
      defaultInstanceType: yup.string().optional(),
      labels: yup.object().defined(),
      lockedPreference: yup.string().optional(),
      operatingSystem: requiredString().defined(),
      preference: yup
        .mixed<BootableVolumeWizardOperatingSystemValues['preference']>()
        .nullable()
        .defined(),
      preferenceKind: yup.string().optional(),
    }) as yup.ObjectSchema<BootableVolumeWizardOperatingSystemValues>;
