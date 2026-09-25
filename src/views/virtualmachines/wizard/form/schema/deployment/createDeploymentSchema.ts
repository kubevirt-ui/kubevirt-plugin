import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';

import { type VMWizardDeploymentValues } from '../../types';
import {
  DNS1123_NAME_MESSAGE,
  INVALID_FIELD_MESSAGE,
  MAX_NAME_LENGTH_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
} from '../shared/messages';

// Main permits a trailing hyphen while typing, then confirms the strict name.
export const vmNameInputSchema = yup
  .string()
  .defined()
  .test('name-input', (value) => isDNS1123LabelLenient(value));

const createNameSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .typeError(t(INVALID_FIELD_MESSAGE))
    .required(t(REQUIRED_FIELD_MESSAGE))
    .max(63, t(MAX_NAME_LENGTH_MESSAGE, { maxNameLength: 63 }))
    .test(
      'dns-1123-name',
      t(DNS1123_NAME_MESSAGE),
      (value) => !value || value.length > 63 || isDNS1123Label(value),
    );

export const createDeploymentSchema = (t: TFunction): yup.ObjectSchema<VMWizardDeploymentValues> =>
  yup
    .object({
      cluster: yup.string().typeError(t(INVALID_FIELD_MESSAGE)).defined(t(REQUIRED_FIELD_MESSAGE)),
      description: yup
        .string()
        .typeError(t(INVALID_FIELD_MESSAGE))
        .defined(t(REQUIRED_FIELD_MESSAGE)),
      folder: yup.string().typeError(t(INVALID_FIELD_MESSAGE)).defined(t(REQUIRED_FIELD_MESSAGE)),
      name: createNameSchema(t),
      project: yup.string().typeError(t(INVALID_FIELD_MESSAGE)).defined(t(REQUIRED_FIELD_MESSAGE)),
    })
    .typeError(t(INVALID_FIELD_MESSAGE));
