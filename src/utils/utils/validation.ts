import { TFunction } from 'i18next';

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

/**
 * @deprecated Prefer `validateDNS1123Label(t, value)` which returns the error string directly.
 * @param value - the DNS label string to validate
 */
export const getDNS1123LabelError = (value: string): ((t: TFunction) => string) | undefined => {
  if (value?.length > DNS1123LabelMaxLength) {
    return maxNameLengthErrorMsg;
  }
  if (!dns1123LabelRegexp.test(value ?? '')) {
    return dns1123LabelErrMsg;
  }
  return undefined;
};

// Tolerates a trailing '-' since the user is likely still typing (e.g. "my-vm-").
// A leading '-' is still rejected because it's never valid.
export const getDNS1123LabelErrorLenient = (value: string): ((t: TFunction) => string) => {
  const error = getDNS1123LabelError(value);
  if (
    error &&
    !value?.startsWith('-') &&
    value?.length <= DNS1123LabelMaxLength &&
    value?.endsWith('-')
  ) {
    return undefined;
  }
  return error;
};

export const isDNS1123LabelLenient = (value: string): boolean =>
  !getDNS1123LabelErrorLenient(value);

export const validateDNS1123Label = (t: TFunction, value: string): string | undefined => {
  const errorFn = getDNS1123LabelError(value);
  return errorFn ? errorFn(t) : undefined;
};
export const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

export const getFieldRequiredMessage = (t: TFunction): string => t('This field is required');

// Standard 5-field cron (minute hour day-of-month month day-of-week)
const CRON_FIELD_PATTERN =
  /^(\*|([0-9]{1,2})(-([0-9]{1,2}))?)(\/[0-9]+)?(,(\*|([0-9]{1,2})(-([0-9]{1,2}))?)(\/[0-9]+)?)*$/;

const isValidCronField = (field: string, minValue: number, maxValue: number): boolean => {
  if (!CRON_FIELD_PATTERN.test(field)) return false;

  const steps = field.match(/\/(\d+)/g);
  if (steps?.some((s) => Number(s.slice(1)) === 0)) return false;

  const numbers = field.match(/\d+/g);
  if (numbers) {
    return numbers.every((n) => {
      const value = Number(n);
      return value >= minValue && value <= maxValue;
    });
  }
  return true;
};

const STANDARD_CRON_FIELD_COUNT = 5;
const CRON_FIELD_MIN = [0, 0, 1, 1, 0];
const CRON_FIELD_MAX = [59, 23, 31, 12, 7];

export const isValidCronExpression = (value: string): boolean => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return false;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length !== STANDARD_CRON_FIELD_COUNT) {
    return false;
  }

  return parts.every((part, i) => isValidCronField(part, CRON_FIELD_MIN[i], CRON_FIELD_MAX[i]));
};

export const getCronScheduleFormatError = (t: TFunction): string =>
  t('Invalid cron schedule format. Use standard cron syntax (e.g., {{ example }}).', {
    example: '0 */12 * * *',
  });

export const validateCronExpression = (t: TFunction, value: string): string | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  if (!isValidCronExpression(value)) {
    return getCronScheduleFormatError(t);
  }

  return undefined;
};
