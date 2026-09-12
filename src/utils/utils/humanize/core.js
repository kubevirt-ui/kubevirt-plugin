import { TYPES } from './constants.js';

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

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

export const convertBaseValueToUnits = (value, unitArray, divisor, initialUnit, preferredUnit) => {
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

export const convertValueWithUnitsToBaseValue = (value, unitArray, divisor) => {
  let cleanValue = value;
  const defaultReturn = { unit: '', value: cleanValue };
  if (typeof cleanValue !== 'string') {
    return defaultReturn;
  }

  let units_ = unitArray.slice().reverse();

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
    return defaultReturn;
  }

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

export const getDefaultFractionDigits = (value) => {
  if (value < 1) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  return 1;
};

export const formatValue = (value, options) => {
  let cleanValue = value;
  const fractionDigits = getDefaultFractionDigits(cleanValue);
  const { locales, ...rest } = Object.assign({}, options, {
    maximumFractionDigits: fractionDigits,
  });

  if (!isFinite(cleanValue) || cleanValue === 0) {
    cleanValue = 0;
  }
  return Intl.NumberFormat(locales, rest).format(cleanValue);
};

export const round = (value, fractionDigits = null) => {
  if (!isFinite(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, fractionDigits || getDefaultFractionDigits(value));
  return Math.round(value * multiplier) / multiplier;
};

export const humanize = (value, typeName, initialUnit, preferredUnit, useRound = false) => {
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
    string: `${formattedValue}${type.space && converted.unit ? ' ' : ''}${converted.unit}`,
    unit: converted.unit,
    value: converted.value,
  };
};
