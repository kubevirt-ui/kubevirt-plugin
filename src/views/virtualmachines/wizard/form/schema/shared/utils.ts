import * as yup from '@kubevirt-utils/yup';

export const requiredString = (): yup.StringSchema<string> => yup.string().required();
