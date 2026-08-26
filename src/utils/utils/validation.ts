import { type TFunction } from 'i18next';

// follow the backend validations
// https://github.com/kubernetes/kubernetes/blob/8d7d7a5e0d4d7e75f5a860574346944b8cc0fc43/staging/src/k8s.io/apimachinery/pkg/util/validation/validation.go#L107-L124
const dns1123LabelRegexp = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

const dns1123LabelErrMsg = (t: TFunction): string =>
  t(
    "a lowercase RFC 1123 label must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character",
  );

// DNS1123LabelMaxLength is a label's max length in DNS (RFC 1123)
const DNS1123LabelMaxLength = 63;

const maxNameLengthErrorMsg = (t: TFunction): string =>
  t('Maximum name length is {{ maxNameLength }} characters', {
    maxNameLength: DNS1123LabelMaxLength,
  });

// DNS-1123 (RFC 1123) is the Kubernetes resource naming convention.
// The "DNS1123" prefix mirrors Kubernetes' own naming (e.g. IsDNS1123Label in apimachinery).
export const isDNS1123Label = (value: string): boolean => !getDNS1123LabelError(value);

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

export const getFieldRequiredMessage = (t: TFunction): string => t('This field is required');

/**
 * Validates a required DNS-1123 name field (trims whitespace before format validation).
 * @param t
 * @param value
 */
export const getNameValidationMessage = (t: TFunction, value: string): string | undefined => {
  if (!value?.trim()) {
    return getFieldRequiredMessage(t);
  }
  return validateDNS1123Label(t, value);
};

export const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

// Standard 5-field cron (minute hour day-of-month month day-of-week)
const CRON_ELEMENT_PATTERN = /^(?:\*|\d{1,2}(?:-\d{1,2})?)(?:\/\d+)?$/;

const isValidCronField = (field: string, minValue: number, maxValue: number): boolean => {
  const elements = field.split(',');
  if (!elements.every((element) => CRON_ELEMENT_PATTERN.test(element))) {
    return false;
  }

  const steps = field.match(/\/(\d+)/g);
  if (steps?.some((step) => Number(step.slice(1)) === 0)) {
    return false;
  }

  const numbers = field.match(/\d+/g);
  if (numbers) {
    return numbers.every((num) => {
      const value = Number(num);
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

  return parts.every((part, idx) =>
    isValidCronField(part, CRON_FIELD_MIN[idx], CRON_FIELD_MAX[idx]),
  );
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

type UrlValidationOptions = {
  /** Empty/whitespace value is considered valid (for optional fields). Default: false. */
  allowEmpty?: boolean;
  /** Paths like /foo/bar are considered valid, in addition to absolute http(s) URLs. Default: false. */
  allowRelative?: boolean;
  /** If set, values longer than this are rejected. */
  maxLength?: number;
};

const canParseUrl = (url: string): boolean => {
  if (URL?.canParse) {
    return URL.canParse(url);
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidUrl = (url: string, options: UrlValidationOptions = {}): boolean => {
  const { allowEmpty, allowRelative, maxLength } = options;
  const trimmed = url?.trim() ?? '';

  if (!trimmed) {
    return !!allowEmpty;
  }
  if (maxLength && trimmed.length > maxLength) {
    return false;
  }
  if (allowRelative && /^\/[^/]/.test(trimmed)) {
    return true;
  }

  if (!canParseUrl(trimmed)) {
    return false;
  }

  try {
    return ['http:', 'https:'].includes(new URL(trimmed).protocol);
  } catch {
    return false;
  }
};
