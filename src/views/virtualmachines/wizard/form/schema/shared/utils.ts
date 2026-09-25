import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { getValidationMessage } from './messages';

export const requiredString = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .typeError(getValidationMessage('INVALID_FIELD_MESSAGE', t))
    .required(getValidationMessage('REQUIRED_FIELD_MESSAGE', t));
