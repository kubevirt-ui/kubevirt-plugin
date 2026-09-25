import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';

import { type VMWizardDeploymentValues } from '../../types';
import { getValidationMessage } from '../shared/messages';

// Main permits a trailing hyphen while typing, then confirms the strict name.
export const vmNameInputSchema = yup
  .string()
  .defined()
  .test('name-input', (value) => isDNS1123LabelLenient(value));

const createNameSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
    .required(getValidationMessage('REQUIRED_FIELD_MESSAGE', t))
    .max(63, getValidationMessage('MAX_NAME_LENGTH_MESSAGE', t, { maxNameLength: 63 }))
    .test(
      'dns-1123-name',
      getValidationMessage('DNS1123_NAME_MESSAGE', t),
      (value) => !value || value.length > 63 || isDNS1123Label(value),
    );

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup
    .object({
      cluster: yup
        .string()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      description: yup
        .string()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      folder: yup
        .string()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
      name: createNameSchema(t),
      project: yup
        .string()
        .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
        .defined(getValidationMessage('REQUIRED_FIELD_MESSAGE', t)),
    })
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t));
