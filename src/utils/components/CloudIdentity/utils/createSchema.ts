import { type TFunction } from 'i18next';

import { createDNS1123SubdomainSchema } from '@kubevirt-utils/utils/createDNS1123SubdomainSchema';
import * as yup from '@kubevirt-utils/yup';

import { CLOUD_IDENTITY_SERVICE_ACCOUNT_SOURCES } from '../constants/constants';
import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { createAWSSchema } from './createAWSSchema';

type CreateSchemaParams = {
  compatibleServiceAccountNames: string[];
  provider: CloudIdentityProvider;
  t: TFunction;
};

type CommonFormValues = Pick<
  CloudIdentityFormValues,
  'existingServiceAccountName' | 'newServiceAccountName' | 'serviceAccountSource'
>;

export const createSchema = ({
  compatibleServiceAccountNames,
  provider,
  t,
}: CreateSchemaParams): yup.ObjectSchema<CloudIdentityFormValues> => {
  const commonSchema: yup.ObjectSchema<CommonFormValues> = yup.object({
    existingServiceAccountName: yup
      .string()
      .trim()
      .defined()
      .when('serviceAccountSource', {
        is: 'existing',
        then: (schema) => schema.oneOf(compatibleServiceAccountNames),
      }),
    newServiceAccountName: yup
      .string()
      .trim()
      .defined()
      .when('serviceAccountSource', {
        is: 'new',
        then: (schema) => schema.concat(createDNS1123SubdomainSchema(t)),
      }),
    serviceAccountSource: yup
      .mixed<CloudIdentityFormValues['serviceAccountSource']>()
      .oneOf([...CLOUD_IDENTITY_SERVICE_ACCOUNT_SOURCES])
      .required(),
  });

  if (provider === 'aws') {
    return commonSchema.concat(createAWSSchema()) as yup.ObjectSchema<CloudIdentityFormValues>;
  }
};
