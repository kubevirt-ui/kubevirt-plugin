import { type TFunction } from 'i18next';
import * as yup from 'yup';

import { INVALID_FIELD_MESSAGE, REQUIRED_FIELD_MESSAGE } from './messages';

export const requiredString = (t: TFunction): yup.StringSchema<string> =>
  yup.string().typeError(t(INVALID_FIELD_MESSAGE)).required(t(REQUIRED_FIELD_MESSAGE));
