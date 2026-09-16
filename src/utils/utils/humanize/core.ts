import { type HumanizeType, TYPES } from './constants';

export type HumanizeResult = {
  string: string;
  unit: string;
  value: number;
};

export type ConvertedValue = {
  unit: string;
  value: number;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

export const getType = (name: string): HumanizeType => {
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

export const convertBaseValueToUnits = (
  value: number,
  unitArray: string[],
  divisor: number,
  initialUnit?: string,
  preferredUnit?: string,
): ConvertedValue => {
  let cleanValue = value;
  const sliceIndex = initialUnit ? unitArray.indexOf(initialUnit) : 0;
  const remainingUnits = unitArray.slice(sliceIndex);

  if (preferredUnit || preferredUnit === '') {
    const unitIndex = remainingUnits.indexOf(preferredUnit);
    if (unitIndex !== -1) {
      return {
        unit: preferredUnit,
        value: cleanValue / divisor ** unitIndex,
      };
    }
  }

  let unit = remainingUnits.shift() ?? '';
  while (cleanValue >= divisor && remainingUnits.length > 0) {
    cleanValue = cleanValue / divisor;
    unit = remainingUnits.shift() ?? '';
  }
  return { unit, value: cleanValue };
};

export const convertValueWithUnitsToBaseValue = (
  value: string,
  unitArray: string[],
  divisor: number,
): ConvertedValue => {
  const defaultReturn = { unit: '', value: Number(value) };
  if (typeof value !== 'string') {
    return defaultReturn;
  }

  const stringValue = value;
  let remainingUnits = unitArray.slice().reverse();

  let truncateStringAt = -1;
  const startingUnitIndex = remainingUnits.findIndex((currentUnitValue) => {
    const index = stringValue.indexOf(currentUnitValue);
    if (index > -1) {
      truncateStringAt = index;
      return true;
    }
    return false;
  });
  if (startingUnitIndex <= 0) {
    return defaultReturn;
  }

  remainingUnits = remainingUnits.slice(startingUnitIndex);
  let cleanValue = parseFloat(stringValue.substring(0, truncateStringAt));

  let unit = remainingUnits.shift() ?? '';
  while (remainingUnits.length > 0) {
    cleanValue = cleanValue * divisor;
    unit = remainingUnits.shift() ?? '';
  }

  return { unit, value: cleanValue };
};

export const getDefaultFractionDigits = (value: number): number => {
  if (value < 1) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  return 1;
};

type FormatValueOptions = Intl.NumberFormatOptions & {
  locales?: Intl.LocalesArgument;
};

export const formatValue = (value: number, options?: FormatValueOptions): string => {
  let cleanValue = value;
  const fractionDigits = getDefaultFractionDigits(cleanValue);
  const { locales, ...rest } = {
    ...options,
    maximumFractionDigits: fractionDigits,
  };

  if (!isFinite(cleanValue) || cleanValue === 0) {
    cleanValue = 0;
  }
  return Intl.NumberFormat(locales, rest).format(cleanValue);
};

export const round = (value: number, fractionDigits: number | null = null): number => {
  if (!isFinite(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, fractionDigits ?? getDefaultFractionDigits(value));
  return Math.round(value * multiplier) / multiplier;
};

export const humanize = (
  value: number,
  typeName: string,
  initialUnit?: string,
  preferredUnit?: string,
  useRound = false,
): HumanizeResult => {
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
