import { Quantity } from '@kubevirt-utils/types/quantity.js';

import {
  convertToBaseValue,
  humanizeBinaryBytes,
  humanizeBinaryBytesWithoutB,
} from './humanize.js';
import {
  BinaryUnit,
  binaryUnitsOrdered,
  DecimalUnit,
  decimalUnitsOrdered,
  QuantityUnit,
} from './unitConstants';

/**
 * A function to return unit for disk size/memory with 'B' suffix.
 * @param {QuantityUnit | string} unit - unit
 * @returns {string}
 */
export const addByteSuffix = (unit: QuantityUnit | string): string =>
  !unit || unit.endsWith('B') ? unit : `${unit}B`;

/**
 * A function to return unit for disk size/memory without 'B' suffix.
 * @param {string} unit - unit
 * @returns {QuantityUnit}
 */
export const removeByteSuffix = (unit: string): QuantityUnit => {
  const newUnit = unit?.endsWith('B') && unit !== 'B' ? unit.slice(0, -1) : unit;
  return newUnit as QuantityUnit;
};

/**
 * A function to return the string for displaying more readable disk size/memory info
 * @param {string} combinedStr - string containing both the value and the unit
 * @returns {string} string for displaying the value and the unit with 'B' suffix, with the space between them
 */
export const readableSizeUnit = (combinedStr: string): string => {
  const combinedString = combinedStr?.replace(/\s/g, ''); // remove empty spaces if there are any, to split the value and unit correctly
  const index = combinedString?.search(/([a-zA-Z]+)/g);
  const [value, unit] =
    index === -1
      ? [combinedString, '']
      : [combinedString?.slice(0, index), combinedString?.slice(index)];

  // if there isn't any specific value/size present, return the original string, for example for the dynamic disk size
  return !value ? combinedStr : `${value} ${addByteSuffix(unit)}`;
};

export const getHumanizedSize = (size: string, bytesOption: 'withB' | 'withoutB' = 'withB') => {
  const baseValue = convertToBaseValue(size);

  if (bytesOption === 'withoutB') {
    return humanizeBinaryBytesWithoutB(baseValue, null);
  }

  return humanizeBinaryBytes(baseValue, null);
};

const extractUnitFromQuantityString = (quantityString: string): null | string => {
  const unitRegex = /[a-zA-Z]+$/; // Matches alphabetic characters at the end of the string
  const match = quantityString.match(unitRegex);
  return match ? match[0] : null;
};

const extractNumberFromQuantityString = (quantityString: string): null | number => {
  const numberRegex = /^[0-9.]+/; // Matches numeric characters (including decimal) at the start of the string
  const match = quantityString.match(numberRegex);
  return match ? parseFloat(match[0]) : null;
};

export const isBinaryUnit = (unit: string): unit is BinaryUnit =>
  binaryUnitsOrdered.includes(BinaryUnit[unit]);

export const isDecimalUnit = (unit: string): unit is DecimalUnit =>
  decimalUnitsOrdered.includes(DecimalUnit[unit]);

const isQuantityUnit = (unit: string): unit is QuantityUnit =>
  isBinaryUnit(unit) || isDecimalUnit(unit);

export const toQuantity = (quantityString: string, keepInitialUnit = true): Quantity => {
  const preferredUnit = keepInitialUnit ? extractUnitFromQuantityString(quantityString) : null;

  if (isQuantityUnit(preferredUnit)) {
    return {
      unit: preferredUnit,
      value: extractNumberFromQuantityString(quantityString),
    };
  }

  // This toQuantity helper could attempt the same conversion for bytes as the formatQuantityString helper, so we don't have to call formatQuantityString helper first if then toQuantity is going to be called on it anyway
  const { unit, value } = getHumanizedSize(quantityString, 'withoutB');

  return { unit, value };
};

export const quantityToString = ({ unit, value }: Quantity) =>
  `${value}${unit === BinaryUnit.B ? '' : unit}`;

const convertBytes = (value: number, base: 'BINARY' | 'DECIMAL') => {
  const divisor = base === 'BINARY' ? 1024 : 1000;
  let index = 0;

  while (value % divisor === 0) {
    value /= divisor;
    index++;
  }

  return { unitIndex: index, value };
};

/**
 * Formats the quantity string that is in bytes format to a more simplified quantity string in integer + unit format (if the conversion to an integer is possible).
 * e.g. '1024' to 1Ki or '1000000' to 1M
 *
 * @param quantityString string to format, must be in a Kubernetes Quantity format: https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/
 * @returns formatted quantity string
 */
export const formatQuantityString = (quantityString: string) => {
  const unit = extractUnitFromQuantityString(quantityString);

  if (isQuantityUnit(unit)) {
    return quantityString;
  }

  if (unit === 'm') {
    // TODO handle specifically, or probably just leave it as it is to be consistent, but then in CapacityInput we have to adjust
    return quantityString;
  }

  if (unit !== null) {
    // ERROR: formatQuantityString helper called with quantityString argument which is not in Quantity format
    return quantityString;
  }

  // convert bytes to integer + unit if possible
  const bytes = Number(quantityString);
  const { unitIndex: binaryUnitIndex, value: binaryValue } = convertBytes(bytes, 'BINARY');
  const { unitIndex: decimalUnitIndex, value: decimalValue } = convertBytes(bytes, 'DECIMAL');

  if (binaryUnitIndex >= decimalUnitIndex) {
    const binaryUnit = binaryUnitsOrdered[binaryUnitIndex];

    return `${binaryValue}${binaryUnit === BinaryUnit.B ? '' : binaryUnit}`;
  }

  return `${decimalValue}${decimalUnitsOrdered[decimalUnitIndex]}`;
};
