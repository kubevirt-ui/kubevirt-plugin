import { type TFunction } from 'i18next';

import { DNS1123LabelMaxLength, getMaxNameLengthErrorMsg } from './validation';

// follow the backend validations
// https://github.com/kubernetes/kubernetes/blob/8d7d7a5e0d4d7e75f5a860574346944b8cc0fc43/staging/src/k8s.io/apimachinery/pkg/util/validation/validation.go#L163-L180
const dns1123SubdomainRegexp = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const dns1123SubdomainErrMsg = (t: TFunction): string =>
  t(
    "a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character",
  );

/** A subdomain's max length in DNS (RFC 1123). */
export const DNS1123SubdomainMaxLength = 253;

/** VM names use DNS-1123 subdomain rules but are capped at 63 chars for migration-safe derived names. */
export const VMNameMaxLength = DNS1123LabelMaxLength;

const getMaxLengthErrorMsg =
  (maxLength: number) =>
  (t: TFunction): string =>
    getMaxNameLengthErrorMsg(t, maxLength);

export const getDNS1123SubdomainErrorWithMaxLength = (
  value: string,
  maxLength: number,
): ((t: TFunction) => string) | undefined => {
  if (value?.length > maxLength) {
    return getMaxLengthErrorMsg(maxLength);
  }
  if (!dns1123SubdomainRegexp.test(value ?? '')) {
    return dns1123SubdomainErrMsg;
  }
  return undefined;
};

export const isDNS1123Subdomain = (value: string): boolean => !getDNS1123SubdomainError(value);

export const getDNS1123SubdomainError = (value: string): ((t: TFunction) => string) | undefined =>
  getDNS1123SubdomainErrorWithMaxLength(value, DNS1123SubdomainMaxLength);

// Tolerates a trailing '-' or '.' since the user is likely still typing (e.g. "my-vm-", "my.vm.").
// A leading '-' or '.' is still rejected because it's never valid.
export const getDNS1123SubdomainErrorLenientWithMaxLength = (
  value: string,
  maxLength: number,
): ((t: TFunction) => string) | undefined => {
  const error = getDNS1123SubdomainErrorWithMaxLength(value, maxLength);

  if (
    error &&
    !value?.startsWith('-') &&
    !value?.startsWith('.') &&
    value?.length <= maxLength &&
    (value?.endsWith('-') || value?.endsWith('.'))
  ) {
    return getDNS1123SubdomainErrorWithMaxLength(value.slice(0, -1), maxLength) ? error : undefined;
  }
  return error;
};

export const getDNS1123SubdomainErrorLenient = (
  value: string,
): ((t: TFunction) => string) | undefined =>
  getDNS1123SubdomainErrorLenientWithMaxLength(value, DNS1123SubdomainMaxLength);

export const isDNS1123SubdomainLenient = (value: string): boolean =>
  !getDNS1123SubdomainErrorLenient(value);

export const getVMNameError = (value: string): ((t: TFunction) => string) | undefined =>
  getDNS1123SubdomainErrorWithMaxLength(value, VMNameMaxLength);

export const getVMNameErrorLenient = (value: string): ((t: TFunction) => string) | undefined =>
  getDNS1123SubdomainErrorLenientWithMaxLength(value, VMNameMaxLength);

export const isVMName = (value: string): boolean => !getVMNameError(value);

export const isVMNameLenient = (value: string): boolean => !getVMNameErrorLenient(value);
