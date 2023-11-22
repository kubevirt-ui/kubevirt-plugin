import { toIECUnit } from '@kubevirt-utils/utils/units';

/**
 * function that checks if rawSize has number
 * @param {string} rawSize raw size
 * @returns the number if exists, otherwise returns null
 */
export const hasNumber = (rawSize: string): number => {
  const number = rawSize?.match(/\d+/g);
  return Number(number);
};

/**
 * function that checks if rawSize has size unit
 * @param {string} rawSize raw size
 * @returns the unit if exists, otherwise returns null
 */
export const hasSizeUnit = (rawSize: string): string => {
  const unit = rawSize?.match(/[a-zA-Z]+/g);
  return unit?.[0];
};

/**
 * function that recieves a raw size and returns formatted size
 * @param {string} rawSize - size to convert
 * @param {string} unit - unit
 * @returns formatted bytes
 */
export const formatBytes = (rawSize: string, unit?: string): string => {
  if (!rawSize) {
    return '-';
  }
  const size = hasNumber(rawSize);
  const sizeUnit = hasSizeUnit(rawSize) || unit;
  const sizeUnits = ['', 'Ki', 'Mi', 'Gi', 'Ti'];
  let unitIndex = (sizeUnit && sizeUnits.findIndex((sUnit) => sUnit === sizeUnit)) || 0;
  let convertedSize = size;
  while (convertedSize >= 1024) {
    convertedSize = convertedSize / 1024;
    ++unitIndex;
  }

  const formattedSize = convertedSize.toFixed(2).concat(' ', toIECUnit(sizeUnits[unitIndex]));
  return formattedSize;
};
