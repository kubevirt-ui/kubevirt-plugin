import { type LocaleObject, setLocale } from 'yup';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type CompleteLocale = {
  [Category in keyof Required<LocaleObject>]: Required<NonNullable<LocaleObject[Category]>>;
};

export const buildYupLocale = (): void => {
  const locale: CompleteLocale = {
    array: {
      length: ({ length }) => t('This field must contain exactly {{length}} items', { length }),
      max: ({ max }) => t('This field must contain at most {{max}} items', { max }),
      min: ({ min }) => t('This field must contain at least {{min}} items', { min }),
    },
    boolean: {
      isValue: ({ value }) =>
        value === 'true' ? t('This field must be true') : t('This field must be false'),
    },
    date: {
      max: ({ max }) =>
        t('This field must be on or before {{max}}', {
          max: max instanceof Date ? max.toISOString() : max,
        }),
      min: ({ min }) =>
        t('This field must be on or after {{min}}', {
          min: min instanceof Date ? min.toISOString() : min,
        }),
    },
    mixed: {
      default: () => t('This field must have a valid value'),
      defined: () => t('This field is required'),
      notNull: () => t('This field is required'),
      notOneOf: ({ values }) =>
        t('This field must not be one of the following values: {{values}}', { values }),
      notType: () => t('This field must have a valid value'),
      oneOf: () => t('This field must have a valid value'),
      required: () => t('This field is required'),
    },
    number: {
      integer: () => t('This field must be an integer'),
      lessThan: ({ less }) => t('This field must be less than {{less}}', { less }),
      max: ({ max }) => t('This field must be less than or equal to {{max}}', { max }),
      min: ({ min }) => t('This field must be greater than or equal to {{min}}', { min }),
      moreThan: ({ more }) => t('This field must be greater than {{more}}', { more }),
      negative: () => t('This field must be a negative number'),
      positive: () => t('This field must be a positive number'),
    },
    object: {
      exact: ({ properties }) =>
        t('This field contains unknown properties: {{properties}}', {
          properties: Array.isArray(properties) ? properties.join(', ') : properties,
        }),
      noUnknown: ({ unknown }) =>
        t('This field contains unknown properties: {{properties}}', {
          properties: Array.isArray(unknown) ? unknown.join(', ') : unknown,
        }),
    },
    string: {
      datetime: () => t('This field must be a valid ISO date-time'),
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Yup locale key.
      datetime_offset: () => t('This field must use the UTC "Z" timezone'),
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Yup locale key.
      datetime_precision: ({ precision }) =>
        t('This field must have exactly {{precision}} fractional second digits', { precision }),
      email: () => t('This field must be a valid email address'),
      length: ({ length }) =>
        t('This field must contain exactly {{length}} characters', { length }),
      lowercase: () => t('This field must be lowercase'),
      matches: ({ regex }) => t('This field must match {{regex}}', { regex: String(regex) }),
      max: ({ max }) => t('This field must contain at most {{max}} characters', { max }),
      min: ({ min }) => t('This field must contain at least {{min}} characters', { min }),
      trim: () => t('This field must not contain leading or trailing whitespace'),
      uppercase: () => t('This field must be uppercase'),
      url: () => t('This field must be a valid URL'),
      uuid: () => t('This field must be a valid UUID'),
    },
    tuple: {
      notType: () => t('This field must be an array with the expected number and types of items'),
    },
  };

  setLocale(locale);
};
