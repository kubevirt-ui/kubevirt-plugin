import { type TFunction } from 'i18next';

import {
  isVMName,
  isVMNameLenient,
  VMNameMaxLength,
} from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import * as yup from '@kubevirt-utils/yup';

import { type VMWizardDeploymentValues } from '../../types';
import { getValidationMessage } from '../shared/messages';

// DNS-1123 subdomain syntax (allows '.') with a 63-char cap for migration-safe derived resource names.
export const vmNameInputSchema = yup
  .string()
  .defined()
  .test('name-input', (value) => isVMNameLenient(value));

const createNameSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .required(getValidationMessage('DNS1123_SUBDOMAIN_NAME_MESSAGE', t))
    .max(
      VMNameMaxLength,
      getValidationMessage('MAX_NAME_LENGTH_MESSAGE', t, {
        maxNameLength: VMNameMaxLength,
      }),
    )
    .test(
      'dns-1123-name',
      getValidationMessage('DNS1123_SUBDOMAIN_NAME_MESSAGE', t),
      (value) => !value || value.length > VMNameMaxLength || isVMName(value),
    );

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup.object({
    cluster: yup.string().defined(),
    description: yup.string().defined(),
    folder: yup.string().defined(),
    name: createNameSchema(t),
    project: yup.string().required(),
  });
