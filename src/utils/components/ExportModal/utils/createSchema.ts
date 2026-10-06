import * as yup from '@kubevirt-utils/yup';

import { type ExportFormValues } from '../types/types';

export const createSchema = (): yup.ObjectSchema<ExportFormValues> =>
  yup.object({
    destination: yup.string().required().nonBlank(),
    password: yup.string().required().nonBlank(),
    registryName: yup.string().required().nonBlank(),
    username: yup.string().required().nonBlank(),
  });
