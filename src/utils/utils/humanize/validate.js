import { isString } from '@kubevirt-utils/utils/utils';

import { TYPES } from './constants.js';
import { units } from './formatters.js';

export const validate = {};

const baseUnitedValidation = (value) => {
  if (value === null || value.length === 0) {
    return null;
  }
  if (value.search(/\s/g) !== -1) {
    return 'white space is not allowed';
  }

  return null;
};

const validateNumber = (float = '') => {
  if (float < 0) {
    return 'must be positive';
  }
  if (!isFinite(float)) {
    return 'must be a number';
  }

  return null;
};

const validCPUUnits = new Set(['m', '']);
const validateCPUUnit = (value = '') => {
  if (validCPUUnits.has(value)) {
    return null;
  }
  return `unrecognized unit: ${value}`;
};

validate.split = (value) => {
  const index = value.search(/([a-zA-Z]+)/g);
  let number = null;
  let unit = null;
  if (index === -1) {
    number = value;
  } else {
    number = value.slice(0, index);
    unit = value.slice(index);
  }
  return [parseFloat(number, 10), unit];
};

validate.CPU = (value = '') => {
  if (!value) {
    return null;
  }
  const error = baseUnitedValidation(value);
  if (error) {
    return error;
  }

  const [number, unit] = validate.split(value);

  if (!unit) {
    return validateNumber(number);
  }

  return validateNumber(number) || validateCPUUnit(unit);
};

const validMemUnits = new Set(['E', 'P', 'T', 'G', 'M', 'k', 'Pi', 'Ti', 'Gi', 'Mi', 'Ki']);
const validateMemUnit = (value = '') => {
  if (validMemUnits.has(value)) {
    return null;
  }
  return `unrecognized unit: ${value}`;
};

const validTimeUnits = new Set(['s', 'm', 'h', 'd', 'M', 'y']);
const validateTimeUnit = (value = '') => {
  if (validTimeUnits.has(value)) {
    return null;
  }
  return `unrecognized unit: ${value}`;
};

validate.time = (value = '') => {
  if (!value) {
    return null;
  }
  const error = baseUnitedValidation(value);
  if (error) {
    return error;
  }

  const [number, unit] = validate.split(value);

  if (!unit) {
    return 'number and unit required';
  }

  return validateNumber(number) || validateTimeUnit(unit);
};

validate.memory = (value = '') => {
  if (!value) {
    return null;
  }
  const error = baseUnitedValidation(value);
  if (error) {
    return error;
  }

  const [number, unit] = validate.split(value);

  if (!unit) {
    return validateNumber(value);
  }

  return validateNumber(number) || validateMemUnit(unit);
};

export const convertToBaseValue = (value) => {
  if (!isString(value)) {
    return null;
  }

  const [number, unit] = validate.split(value);
  const validationError = validateNumber(number);
  if (validationError) {
    return null;
  }

  if (!unit) {
    return number;
  }

  if (unit === 'm') {
    return number / 1000;
  }

  if (TYPES.binaryBytesWithoutB.units.includes(unit)) {
    return units.dehumanize(value, 'binaryBytesWithoutB').value;
  }

  if (TYPES.decimalBytesWithoutB.units.includes(unit)) {
    return units.dehumanize(value, 'decimalBytesWithoutB').value;
  }

  return null;
};

export const secondsToNanoSeconds = (value) => {
  const val = Number(value);
  return Number.isFinite(val) ? val * 1000 ** 3 : 0;
};

export const formatToFractionalDigits = (value, digits) =>
  Intl.NumberFormat(null, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

export const formatBytesAsMiB = (bytes) => {
  const mib = bytes / 1024 / 1024;
  return formatToFractionalDigits(mib, 1);
};

export const formatBytesAsGiB = (bytes) => {
  const gib = bytes / 1024 / 1024 / 1024;
  return formatToFractionalDigits(gib, 2);
};

export const formatCores = (cores) => formatToFractionalDigits(cores, 3);
