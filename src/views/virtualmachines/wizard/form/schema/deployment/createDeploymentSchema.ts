import { type TFunction } from 'i18next';

import {
  DNS1123SubdomainMaxLength,
  isDNS1123Subdomain,
  isDNS1123SubdomainLenient,
} from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import * as yup from '@kubevirt-utils/yup';

import { type VMWizardDeploymentValues } from '../../types';
import { getValidationMessage } from '../shared/messages';

// Main permits a trailing hyphen while typing, then confirms the strict name.
export const vmNameInputSchema = yup
  .string()
  .defined()
  .test('name-input', (value) => isDNS1123SubdomainLenient(value));

const createNameSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .required(getValidationMessage('DNS1123_SUBDOMAIN_NAME_MESSAGE', t))
    .max(
      DNS1123SubdomainMaxLength,
      getValidationMessage('MAX_NAME_LENGTH_MESSAGE', t, {
        maxNameLength: DNS1123SubdomainMaxLength,
      }),
    )
    .test(
      'dns-1123-name',
      getValidationMessage('DNS1123_SUBDOMAIN_NAME_MESSAGE', t),
      (value) => !value || value.length > DNS1123SubdomainMaxLength || isDNS1123Subdomain(value),
    );

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup.object({
    cluster: yup.string().defined(),
    description: yup.string().defined(),
    folder: yup.string().defined(),
    name: createNameSchema(t),
    project: yup.string().required(),
  });
