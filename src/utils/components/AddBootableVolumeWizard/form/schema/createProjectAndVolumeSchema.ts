import * as yup from '@kubevirt-utils/yup';

import type { BootableVolumeWizardProjectAndVolumeValues } from '../types';

import { requiredString } from './shared/utils';

export const createProjectAndVolumeSchema =
  (): yup.ObjectSchema<BootableVolumeWizardProjectAndVolumeValues> =>
    yup.object({
      description: yup.string().defined(),
      destinationProject: requiredString().defined(),
      volumeName: requiredString().defined(),
    });
