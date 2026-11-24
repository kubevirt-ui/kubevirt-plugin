import { type TFunction } from 'i18next';

import {
  dns1123SubdomainErrMsg,
  DNS1123SubdomainMaxLength,
  isDNS1123Subdomain,
} from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import { getMaxNameLengthErrorMsg } from '@kubevirt-utils/utils/validation';
import * as yup from '@kubevirt-utils/yup';

export const createDNS1123SubdomainSchema = (t: TFunction): yup.StringSchema<string> =>
  yup
    .string()
    .required()
    .max(DNS1123SubdomainMaxLength, getMaxNameLengthErrorMsg(t, DNS1123SubdomainMaxLength))
    .test(
      'dns-1123-subdomain',
      dns1123SubdomainErrMsg(t),
      (value) => !value || value.length > DNS1123SubdomainMaxLength || isDNS1123Subdomain(value),
    );
