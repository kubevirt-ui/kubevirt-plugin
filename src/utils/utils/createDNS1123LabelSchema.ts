import { type TFunction } from 'i18next';

import {
  dns1123LabelErrMsg,
  DNS1123LabelMaxLength,
  getMaxNameLengthErrorMsg,
  isDNS1123Label,
} from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

export const createDNS1123LabelSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .required(dns1123LabelErrMsg(t))
    .max(DNS1123LabelMaxLength, getMaxNameLengthErrorMsg(t, DNS1123LabelMaxLength))
    .test(
      'dns-1123-name',
      dns1123LabelErrMsg(t),
      (value) => !value || value.length > DNS1123LabelMaxLength || isDNS1123Label(value),
    );
