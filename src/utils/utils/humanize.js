import { isString } from '@kubevirt-utils/utils/utils';

export const units = {};
export const validate = {};

const TYPES = {
  binaryBytes: {
    divisor: 1024,
    space: true,
    units: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
  },
  binaryBytesWithoutB: {
    divisor: 1024,
    space: true,
    units: ['i', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'],
  },
  decimalBytes: {
    divisor: 1000,
    space: true,
    units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'],
  },
  decimalBytesPerSec: {
    divisor: 1000,
    space: true,
    units: ['Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps'],
  },
  decimalBytesWithoutB: {
    divisor: 1000,
    space: true,
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
  },
  numeric: {
    divisor: 1000,
    space: false,
    units: ['', 'k', 'm', 'b'],
  },
  packetsPerSec: {
    divisor: 1000,
    space: true,
    units: ['pps', 'kpps'],
  },
  seconds: {
    divisor: 1000,
    space: true,
    units: ['ns', 'μs', 'ms', 's'],
  },
  SI: {
    divisor: 1000,
    space: false,
    units: ['', 'k', 'M', 'G', 'T', 'P', 'E'],
  },
};

const isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

export const getType = (name) => {
  const type = TYPES[name];
  if (!isPlainObject(type)) {
    return {
      divisor: 1000,
      space: false,
      units: [],
    };
  }
  return type;
};

const convertBaseValueToUnits = (value, unitArray, divisor, initialUnit, preferredUnit) => {
  let cleanValue = value;
  const sliceIndex = initialUnit ? unitArray.indexOf(initialUnit) : 0;
  const units_ = unitArray.slice(sliceIndex);

  if (preferredUnit || preferredUnit === '') {
    const unitIndex = units_.indexOf(preferredUnit);
    if (unitIndex !== -1) {
      return {
        unit: preferredUnit,
        value: cleanValue / divisor ** unitIndex,
      };
    }
  }

  let unit = units_.shift();
  while (cleanValue >= divisor && units_.length > 0) {
    cleanValue = cleanValue / divisor;
    unit = units_.shift();
  }
  return { unit, value: cleanValue };
};

const convertValueWithUnitsToBaseValue = (value, unitArray, divisor) => {
  let cleanValue = value;
  const defaultReturn = { unit: '', value: cleanValue };
  if (typeof cleanValue !== 'string') {
    return defaultReturn;
  }

  let units_ = unitArray.slice().reverse();

  // find which unit we're given
  let truncateStringAt = -1;
  const startingUnitIndex = units_.findIndex((currentUnitValue) => {
    const index = cleanValue.indexOf(currentUnitValue);
    if (index > -1) {
      truncateStringAt = index;
      return true;
    }
    return false;
  });
  if (startingUnitIndex <= 0) {
    // can't parse
    return defaultReturn;
  }

  // get the numeric value & prepare unit array for conversion
  units_ = units_.slice(startingUnitIndex);
  cleanValue = cleanValue.substring(0, truncateStringAt);
  cleanValue = parseFloat(cleanValue);

  let unit = units_.shift();
  while (units_.length > 0) {
    cleanValue = cleanValue * divisor;
    unit = units_.shift();
  }

  return { unit, value: cleanValue };
};

const getDefaultFractionDigits = (value) => {
  if (value < 1) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  return 1;
};

const formatValue = (value, options) => {
  let cleanValue = value;
  const fractionDigits = getDefaultFractionDigits(cleanValue);
  const { locales, ...rest } = Object.assign({}, options, {
    maximumFractionDigits: fractionDigits,
  });

  // 2nd check converts -0 to 0.
  if (!isFinite(cleanValue) || cleanValue === 0) {
    cleanValue = 0;
  }
  return Intl.NumberFormat(locales, rest).format(cleanValue);
};

const round = (units.round = (value, fractionDigits = null) => {
  if (!isFinite(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, fractionDigits || getDefaultFractionDigits(value));
  return Math.round(value * multiplier) / multiplier;
});

const humanize = (units.humanize = (
  value,
  typeName,
  initialUnit,
  preferredUnit,
  useRound = false,
) => {
  const type = getType(typeName);
  let cleanValue = value;

  if (!isFinite(cleanValue)) {
    cleanValue = 0;
  }

  let converted = convertBaseValueToUnits(
    cleanValue,
    type.units,
    type.divisor,
    initialUnit,
    preferredUnit,
  );

  if (useRound) {
    converted.value = round(converted.value);
    converted = convertBaseValueToUnits(
      converted.value,
      type.units,
      type.divisor,
      converted.unit,
      preferredUnit,
    );
  }

  const formattedValue = formatValue(converted.value);

  return {
    string: type.space ? `${formattedValue} ${converted.unit}` : formattedValue + converted.unit,
    unit: converted.unit,
    value: converted.value,
  };
});

const formatPercentage = (value, options) => {
  const { locales, ...rest } = Object.assign(
    {},
    { style: 'percent' }, // Don't allow parent style to be overridden.
    options,
    {
      maximumFractionDigits: 1,
    },
  );
  return Intl.NumberFormat(locales, rest).format(value);
};

export const humanizeBinaryBytesWithoutB = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytesWithoutB', initialUnit, preferredUnit, true);
export const humanizeBinaryBytes = (v, initialUnit, preferredUnit) =>
  humanize(v, 'binaryBytes', initialUnit, preferredUnit, true);
export const humanizeDecimalBytes = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytes', initialUnit, preferredUnit, true);
export const humanizeDecimalBytesPerSec = (v, initialUnit, preferredUnit) =>
  humanize(v, 'decimalBytesPerSec', initialUnit, preferredUnit, true);
export const humanizePacketsPerSec = (v, initialUnit, preferredUnit) =>
  humanize(v, 'packetsPerSec', initialUnit, preferredUnit, true);
export const humanizeNumber = (v, initialUnit, preferredUnit) =>
  humanize(v, 'numeric', initialUnit, preferredUnit, true);
export const humanizeNumberSI = (v, initialUnit, preferredUnit) =>
  humanize(v, 'SI', initialUnit, preferredUnit, true);
export const humanizeSeconds = (v, initialUnit, preferredUnit) =>
  humanize(v, 'seconds', initialUnit, preferredUnit, true);
export const humanizeCpuCores = (v) => {
  const value = v < 1 ? round(v * 1000) : v;
  const unit = v < 1 ? 'm' : '';
  return {
    string: `${formatValue(value)}${unit}`,
    unit,
    value,
  };
};
export const humanizePercentage = (value) => {
  let cleanValue = value;
  // 2nd check converts -0 to 0.
  if (!isFinite(cleanValue) || cleanValue === 0) {
    cleanValue = 0;
  }
  return {
    string: formatPercentage(cleanValue / 100),
    unit: '%',
    value: round(cleanValue, 1),
  };
};

units.dehumanize = (value, typeName) => {
  const type = getType(typeName);
  return convertValueWithUnitsToBaseValue(value, type.units, type.divisor);
};

validate.split = (value) => {
  // skipcq: JS-0113
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

// Convert k8s compute resources values to a base value for comparison.
// If the value has no unit, it just returns the number, so this function
// can be used for any quota resource (resource counts). `units.dehumanize`
// is problematic for comparing quota resources because you need to know
// what unit you're dealing with already (e.g. decimal vs binary). Returns
// null if value isn't recognized as valid.
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

  // Handle CPU millicores specifically.
  if (unit === 'm') {
    return number / 1000;
  }

  if (TYPES.binaryBytesWithoutB.units.includes(unit)) {
    return units.dehumanize(value, 'binaryBytesWithoutB').value;
  }

  if (TYPES.decimalBytesWithoutB.units.includes(unit)) {
    return units.dehumanize(value, 'decimalBytesWithoutB').value;
  }

  // Unrecognized unit.
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
