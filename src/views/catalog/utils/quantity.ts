import byteSize, { ByteSizeResult } from 'byte-size';

import { binaryUnits, customUnits, multipliers, toIECUnit } from '@kubevirt-utils/utils/units';

export const bytesToIECBytes = (
  bytes: number,
  precision: number,
  customizedUnits = customUnits,
): ByteSizeResult => {
  return byteSize(bytes, {
    precision,
    customUnits: customizedUnits,
    units: 'IS',
  });
};

export const bytesToDiskSize = (size: string) => {
  const bytesizeresult = bytesToIECBytes(parseFloat(size), 0, binaryUnits);
  return [bytesizeresult.value, bytesizeresult.unit].join('');
};

export const bytesFromQuantity = (
  quantity: string | number,
  precision = 0,
): [value: number, unit: string] => {
  let byteSizeResult: ByteSizeResult = undefined;

  if (typeof quantity === 'number') {
    byteSizeResult = bytesToIECBytes(quantity, precision);
  }

  if (typeof quantity === 'string') {
    const value = parseFloat(quantity);
    const ISUnit = /[KMGTPEZ]i$/.exec(quantity);
    const bytesUnit = /[KMGTPEZ]iB$/.exec(quantity);
    const decimalUnit = /[KMGTPEZ]$/.exec(quantity.toUpperCase());
    const originalUnit = ISUnit || bytesUnit || decimalUnit;

    if (originalUnit?.length) {
      const bytes = value * multipliers[bytesUnit?.[0] || ISUnit?.[0] || decimalUnit?.[0]];
      byteSizeResult = bytesToIECBytes(bytes, precision);

      // Prevents units from changing to 'B' when user enters 0 or erases existing value
      if (value === 0) {
        byteSizeResult.unit = toIECUnit(originalUnit?.[0]) || byteSizeResult?.unit;
      }
    } else {
      byteSizeResult = bytesToIECBytes(value, precision);
    }
  }

  return [parseFloat(byteSizeResult.value), byteSizeResult.unit];
};
