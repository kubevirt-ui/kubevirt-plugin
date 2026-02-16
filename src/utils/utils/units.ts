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
  decimalUnitsOrderedDescending,
  EXPONENTIAL_REGEX,
  NUMBER_REGEX,
  QuantityUnit,
  UNIT_REGEX,
} from './unitConstants';
import { isEmpty } from './utils';

/**
 * A function to return unit for disk size/memory with 'B' suffix.
 * @param {QuantityUnit | string} unit - unit
 * @returns {string}
 */
export const addByteSuffix = (unit: QuantityUnit | string): string =>
  !unit || unit.endsWith('B') ? unit : `${unit}B`;

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

export const getHumanizedSize = (
  size: string,
  bytesOption: 'withB' | 'withoutB' = 'withB',
  preferredUnit?: string,
) => {
  const baseValue = convertToBaseValue(size);

  if (bytesOption === 'withoutB') {
    return humanizeBinaryBytesWithoutB(baseValue, null, preferredUnit);
  }

  return humanizeBinaryBytes(baseValue, null, preferredUnit);
};

export const extractUnitFromQuantityString = (quantityString?: string) =>
  quantityString?.match(UNIT_REGEX)?.[0];

export const extractNumberFromQuantityString = (quantityString?: string) => {
  const match = quantityString?.match(NUMBER_REGEX);
  return match ? parseFloat(match[0]) : null;
};

const isExponentialNotation = (quantityString: string): boolean =>
  EXPONENTIAL_REGEX.test(quantityString);

export const isBinaryUnit = (unit: string): unit is BinaryUnit =>
  binaryUnitsOrdered.includes(BinaryUnit[unit]);

export const isDecimalUnit = (unit: string): unit is DecimalUnit =>
  decimalUnitsOrdered.includes(DecimalUnit[unit]);

const isQuantityUnit = (unit: string): unit is QuantityUnit =>
  isBinaryUnit(unit) || isDecimalUnit(unit);

const isFractionalUnit = (unit: string): boolean => {
  return unit === 'm' || unit === 'u' || unit === 'n';
};

/**
 * Converts exponential notation to decimal format with appropriate unit
 * @param quantityString a quantity string in exponential notation
 */
const convertExponentialToDecimal = (quantityString: string): Quantity => {
  const numericValue = parseFloat(quantityString);

  const decimalMultipliers: Record<DecimalUnit, number> = {
    [DecimalUnit.B]: 1,
    [DecimalUnit.E]: 1e18,
    [DecimalUnit.G]: 1e9,
    [DecimalUnit.k]: 1e3,
    [DecimalUnit.M]: 1e6,
    [DecimalUnit.P]: 1e15,
    [DecimalUnit.T]: 1e12,
  };

  // Find the appropriate unit by checking from largest to smallest
  const largestUnit = decimalUnitsOrderedDescending.find(
    (unit) => numericValue / decimalMultipliers[unit] >= 1,
  );

  if (!largestUnit) {
    return { unit: DecimalUnit.B, value: numericValue };
  }

  return { unit: largestUnit, value: numericValue / decimalMultipliers[largestUnit] };
};

/**
 * Converts a quantity string to a Quantity object.
 * @param quantityString - The quantity string to convert, must be in a {@link https://github.com/kubevirt/kubevirt/blob/205d9455db56d5fcd42fb331122cfef358f19a69/vendor/k8s.io/apimachinery/pkg/api/resource/quantity.go#L33 Kubernetes Quantity} format
 * @returns The Quantity object.
 */
export const toQuantity = (quantityString: string): Quantity => {
  if (isExponentialNotation(quantityString)) {
    return convertExponentialToDecimal(quantityString);
  }

  const preferredUnit = extractUnitFromQuantityString(quantityString);

  if (isQuantityUnit(preferredUnit)) {
    return {
      unit: preferredUnit,
      value: extractNumberFromQuantityString(quantityString),
    };
  }

  // convert bytes or millibytes to a larger unit (if the corresponding value for that unit is >= 1)
  // value CAN BE a floating point number
  const { unit, value } = getHumanizedSize(quantityString, 'withoutB');

  return { unit, value };
};

export const quantityToString = ({ unit, value }: Quantity) =>
  `${value}${unit === 'B' ? '' : unit}`;

/**
 * Converts bytes to a larger unit (if the corresponding value for that unit is >= 1)
 * @param value - The value to convert.
 * @param base - The base to convert to.
 * @returns The converted value and unit.
 */
const convertBytes = (value: number, base: 'BINARY' | 'DECIMAL') => {
  if (value === 0) {
    return { unitIndex: 0, value };
  }

  const divisor = base === 'BINARY' ? 1024 : 1000;
  let index = 0;

  while (value % divisor === 0) {
    value /= divisor;
    index++;
  }

  return { unitIndex: index, value };
};

/**
 * Formats the quantity string to a more simplified quantity string in integer + unit format (if the conversion to an integer is possible). Aims for largest unit possible and prefers binary over decimal.
 * e.g. '1024' to 1Ki or '1000000' to 1M
 *
 * @param quantityString string to format, must be in a {@link https://github.com/kubevirt/kubevirt/blob/205d9455db56d5fcd42fb331122cfef358f19a69/vendor/k8s.io/apimachinery/pkg/api/resource/quantity.go#L33 Kubernetes Quantity} format
 * @param convertBytesOnly if true, it will only format a string that is in bytes format (other strings with a unit will be untouched). Defaults to true.
 * @returns formatted quantity string
 */
export const formatQuantityString = (quantityString: string, convertBytesOnly: boolean = true) => {
  if (isEmpty(quantityString)) {
    return null;
  }

  const unit = extractUnitFromQuantityString(quantityString);

  const isValidQuantityUnit = isQuantityUnit(unit);

  // special case when unit = 'm' can occur, e.g. if we create a PVC with floating point number like 0.2Gi (1/5 Gi) which can't be converted to bytes (power of 2 is not divisible by 5), 'm' then stands for milibytes
  if ((convertBytesOnly && isValidQuantityUnit) || isFractionalUnit(unit)) {
    return quantityString;
  }

  if (!isEmpty(unit) && !isValidQuantityUnit) {
    // ERROR: formatQuantityString helper called with quantityString argument which is not in Quantity format
    // TODO: implement isQuantityString helper to check the format first
    return '0';
  }

  const bytes = Number(isValidQuantityUnit ? convertToBaseValue(quantityString) : quantityString);
  const { unitIndex: binaryUnitIndex, value: binaryValue } = convertBytes(bytes, 'BINARY');
  const { unitIndex: decimalUnitIndex, value: decimalValue } = convertBytes(bytes, 'DECIMAL');

  if (binaryUnitIndex >= decimalUnitIndex) {
    return quantityToString({ unit: binaryUnitsOrdered[binaryUnitIndex], value: binaryValue });
  }

  return quantityToString({ unit: decimalUnitsOrdered[decimalUnitIndex], value: decimalValue });
};
