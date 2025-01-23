import { Buffer } from 'buffer';

import { RegistryCredentials } from '@catalog/utils/useRegistryCredentials/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

const decodeValue = (value: string): string => Buffer.from(value || '', 'base64').toString();

export const getDecodedRegistryCredentials = (encodedCredentials: RegistryCredentials) =>
  encodedCredentials && !isEmpty(encodedCredentials)
    ? Object.entries(encodedCredentials)?.reduce((acc, [key, value]) => {
        acc[key] = decodeValue(value);
        return acc;
      }, {})
    : {};
