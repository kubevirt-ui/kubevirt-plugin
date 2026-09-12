import { convertValueWithUnitsToBaseValue, formatValue, getType, humanize, round } from './core.js';

const formatPercentage = (value, options) => {
  const { locales, ...rest } = Object.assign({}, { style: 'percent' }, options, {
    maximumFractionDigits: 1,
  });
  return Intl.NumberFormat(locales, rest).format(value);
};

export const humanizeBinaryBytesWithoutB = (value, initialUnit, preferredUnit) =>
  humanize(value, 'binaryBytesWithoutB', initialUnit, preferredUnit, true);
export const humanizeBinaryBytes = (value, initialUnit, preferredUnit) =>
  humanize(value, 'binaryBytes', initialUnit, preferredUnit, true);
export const humanizeDecimalBytes = (value, initialUnit, preferredUnit) =>
  humanize(value, 'decimalBytes', initialUnit, preferredUnit, true);
export const humanizeDecimalBytesPerSec = (value, initialUnit, preferredUnit) =>
  humanize(value, 'decimalBytesPerSec', initialUnit, preferredUnit, true);
export const humanizePacketsPerSec = (value, initialUnit, preferredUnit) =>
  humanize(value, 'packetsPerSec', initialUnit, preferredUnit, true);
export const humanizeNumber = (value, initialUnit, preferredUnit) =>
  humanize(value, 'numeric', initialUnit, preferredUnit, true);
export const humanizeNumberSI = (value, initialUnit, preferredUnit) =>
  humanize(value, 'SI', initialUnit, preferredUnit, true);
export const humanizeSeconds = (value, initialUnit, preferredUnit) =>
  humanize(value, 'seconds', initialUnit, preferredUnit, true);
export const humanizeCpuCores = (value) => {
  const normalizedValue = value < 1 ? round(value * 1000) : value;
  const unit = value < 1 ? 'm' : '';
  return {
    string: `${formatValue(normalizedValue)} ${unit}`,
    unit,
    value: normalizedValue,
  };
};
export const humanizePercentage = (value) => {
  let cleanValue = value;
  if (!isFinite(cleanValue) || cleanValue === 0) {
    cleanValue = 0;
  }
  return {
    string: formatPercentage(cleanValue / 100),
    unit: '%',
    value: round(cleanValue, 1),
  };
};

export const units = {};
units.dehumanize = (value, typeName) => {
  const type = getType(typeName);
  return convertValueWithUnitsToBaseValue(value, type.units, type.divisor);
};
units.round = round;
units.humanize = humanize;
