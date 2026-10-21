import * as yup from '@kubevirt-utils/yup';

export const requiredString = (): yup.StringSchema<string> =>
  yup.string().defined().nonBlank().required();

export const optionalString = (): yup.StringSchema<string> => yup.string().defined();

export const getConditionalString = (required: boolean): yup.StringSchema<string> =>
  (required ? requiredString() : optionalString()).defined();
