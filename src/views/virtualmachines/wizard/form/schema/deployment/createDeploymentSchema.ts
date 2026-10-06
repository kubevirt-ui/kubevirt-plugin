import { type TFunction } from 'i18next';

import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

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
    .required()
    .max(63, getValidationMessage('MAX_NAME_LENGTH_MESSAGE', t, { maxNameLength: 63 }))
    .test(
      'dns-1123-name',
      getValidationMessage('DNS1123_NAME_MESSAGE', t),
      (value) => !value || value.length > 63 || isDNS1123Label(value),
    );

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup.object({
    cluster: yup.string().defined(),
    description: yup.string().defined(),
    folder: yup.string().defined(),
    name: createNameSchema(t),
    project: yup.string().defined(),
  });
