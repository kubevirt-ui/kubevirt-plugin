import { type TFunction } from 'i18next';

import { createVMNameSchema } from '@kubevirt-utils/utils/createVMNameSchema';
import * as yup from '@kubevirt-utils/yup';

import { type VMWizardDeploymentValues } from '../../types';

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup.object({
    cluster: yup.string().defined(),
    description: yup.string().defined(),
    folder: yup.string().defined(),
    name: createVMNameSchema(t),
    project: yup.string().required(),
  });
