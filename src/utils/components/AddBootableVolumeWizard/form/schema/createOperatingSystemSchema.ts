import * as yup from '@kubevirt-utils/yup';

import type { BootableVolumeWizardOperatingSystemValues } from '../types';

import { requiredString } from './shared/utils';

export const createOperatingSystemSchema =
  (): yup.ObjectSchema<BootableVolumeWizardOperatingSystemValues> =>
    yup.object({
      architecture: requiredString().defined(),
      defaultInstanceType: yup.string().optional(),
      operatingSystem: requiredString().defined(),
      preference: yup
        .mixed<BootableVolumeWizardOperatingSystemValues['preference']>()
        .nullable()
        .defined(),
      preferenceKind: yup.string().optional(),
    });
