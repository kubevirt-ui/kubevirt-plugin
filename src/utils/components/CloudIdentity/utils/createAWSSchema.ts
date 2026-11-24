import * as yup from '@kubevirt-utils/yup';

import { type CloudIdentityFormValues } from '../types/types';

type ProviderFormValues = Pick<CloudIdentityFormValues, 'awsRoleArn'>;

export const createAWSSchema = (): yup.ObjectSchema<ProviderFormValues> =>
  yup.object({
    awsRoleArn: yup
      .string()
      .trim()
      .defined()
      .when('serviceAccountSource', {
        is: 'new',
        then: (schema) => schema.required(),
      }),
  });
