import { TFunction } from 'react-i18next';

// follow the backend validations
// https://github.com/kubernetes/kubernetes/blob/8d7d7a5e0d4d7e75f5a860574346944b8cc0fc43/staging/src/k8s.io/apimachinery/pkg/util/validation/validation.go#L107-L124
const dns1123LabelRegexp = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

const dns1123LabelErrMsg = (t: TFunction) =>
  t(
    "a lowercase RFC 1123 label must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character",
  );

// DNS1123LabelMaxLength is a label's max length in DNS (RFC 1123)
const DNS1123LabelMaxLength = 63;

const maxNameLengthErrorMsg = (t: TFunction) =>
  t('Maximum name length is {{ maxNameLength }} characters', {
    maxNameLength: DNS1123LabelMaxLength,
  });

// IsDNS1123Label tests for a string that conforms to the definition of a label in
// DNS (RFC 1123).
export const isDNS1123Label = (value: string): boolean => !getDNS1123LabelError(value);

export const getDNS1123LabelError = (value: string): ((t: TFunction) => string) => {
  if (value?.length > DNS1123LabelMaxLength) {
    return maxNameLengthErrorMsg;
  }
  if (!dns1123LabelRegexp.test(value ?? '')) {
    return dns1123LabelErrMsg;
  }
  return undefined;
};

export const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);
