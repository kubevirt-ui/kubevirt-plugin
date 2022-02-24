import byteSize, { ByteSizeResult } from 'byte-size';

const multipliers: Record<string, number> = {};
multipliers.B = 1;
multipliers.KI = multipliers.B * 1024;
multipliers.MI = multipliers.KI * 1024;
multipliers.GI = multipliers.MI * 1024;
multipliers.TI = multipliers.GI * 1024;
multipliers.PI = multipliers.TI * 1024;
multipliers.EI = multipliers.PI * 1024;
multipliers.ZI = multipliers.EI * 1024;
multipliers.K = multipliers.B * 1000;
multipliers.M = multipliers.K * 1000;
multipliers.G = multipliers.M * 1000;
multipliers.T = multipliers.G * 1000;
multipliers.P = multipliers.T * 1000;
multipliers.E = multipliers.P * 1000;
multipliers.Z = multipliers.E * 1000;

export const bytesToIECBytes = (bytes: number): ByteSizeResult => {
  return byteSize(bytes, {
    units: 'iec',
  });
};

export const bytesFromQuantity = (quantity: string | number): [value: number, unit: string] => {
  let byteSizeResult: ByteSizeResult = undefined;

  if (typeof quantity === 'number') {
    byteSizeResult = bytesToIECBytes(quantity);
  }

  if (typeof quantity === 'string') {
    const ISUnit = /[KMGTPEZ]i$/.exec(quantity);

    if (ISUnit?.length) return [parseInt(quantity), ISUnit[0] + 'B'];

    const bytesUnit = /[KMGTPEZ]IB$/.exec(quantity.toUpperCase());

    if (bytesUnit?.length) {
      return [parseInt(quantity, 10), bytesUnit[0]];
    }

    const decimalUnit = /[KMGTPEZ]$/.exec(quantity.toUpperCase());

    if (decimalUnit?.length) {
      const value = parseInt(quantity, 10);
      const bytes = value * multipliers[ISUnit?.[0] || decimalUnit?.[0]];

      byteSizeResult = bytesToIECBytes(bytes);
    } else {
      byteSizeResult = bytesToIECBytes(parseInt(quantity, 10));
    }
  }

  return [parseInt(byteSizeResult.value, 10), byteSizeResult.unit];
};

export const ISUnitFromBytes = (bytes: string | number): string => {
  if (typeof bytes === 'number') return bytes.toString();

  return bytes.replace(/[Bb]/g, '');
};
