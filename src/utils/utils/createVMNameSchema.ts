import { type TFunction } from 'i18next';

import {
  dns1123SubdomainErrMsg,
  isVMName,
  VMNameMaxLength,
} from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import { getMaxNameLengthErrorMsg } from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

export const createVMNameSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .required(dns1123SubdomainErrMsg(t))
    .max(VMNameMaxLength, getMaxNameLengthErrorMsg(t, VMNameMaxLength))
    .test(
      'dns-1123-vm-name',
      dns1123SubdomainErrMsg(t),
      (value) => !value || value.length > VMNameMaxLength || isVMName(value),
    );
