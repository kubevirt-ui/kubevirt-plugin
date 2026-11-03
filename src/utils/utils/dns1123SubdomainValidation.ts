import { type TFunction } from 'i18next';

import { getMaxNameLengthErrorMsg } from './validation';

// follow the backend validations
// https://github.com/kubernetes/kubernetes/blob/8d7d7a5e0d4d7e75f5a860574346944b8cc0fc43/staging/src/k8s.io/apimachinery/pkg/util/validation/validation.go#L163-L180
const dns1123SubdomainRegexp = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const dns1123SubdomainErrMsg = (t: TFunction): string =>
  t(
    "a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character",
  );

/** A subdomain's max length in DNS (RFC 1123). */
export const DNS1123SubdomainMaxLength = 253;

const maxSubdomainLengthErrorMsg = (t: TFunction): string =>
  getMaxNameLengthErrorMsg(t, DNS1123SubdomainMaxLength);

export const isDNS1123Subdomain = (value: string): boolean => !getDNS1123SubdomainError(value);

export const getDNS1123SubdomainError = (value: string): ((t: TFunction) => string) | undefined => {
  if (value?.length > DNS1123SubdomainMaxLength) {
    return maxSubdomainLengthErrorMsg;
  }
  if (!dns1123SubdomainRegexp.test(value ?? '')) {
    return dns1123SubdomainErrMsg;
  }
  return undefined;
};

// Tolerates a trailing '-' or '.' since the user is likely still typing (e.g. "my-vm-", "my.vm.").
// A leading '-' or '.' is still rejected because it's never valid.
export const getDNS1123SubdomainErrorLenient = (
  value: string,
): ((t: TFunction) => string) | undefined => {
  const error = getDNS1123SubdomainError(value);

  if (
    error &&
    !value?.startsWith('-') &&
    !value?.startsWith('.') &&
    value?.length <= DNS1123SubdomainMaxLength &&
    (value?.endsWith('-') || value?.endsWith('.'))
  ) {
    return getDNS1123SubdomainError(value.slice(0, -1)) ? error : undefined;
  }
  return error;
};

export const isDNS1123SubdomainLenient = (value: string): boolean =>
  !getDNS1123SubdomainErrorLenient(value);
