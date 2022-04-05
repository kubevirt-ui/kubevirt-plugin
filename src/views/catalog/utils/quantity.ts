import byteSize, { ByteSizeResult } from 'byte-size';

const multipliers: Record<string, number> = {};
multipliers.B = 1;
multipliers.Ki = multipliers.B * 1024;
multipliers.Mi = multipliers.Ki * 1024;
multipliers.Gi = multipliers.Mi * 1024;
multipliers.Ti = multipliers.Gi * 1024;
multipliers.Pi = multipliers.Ti * 1024;
multipliers.Ei = multipliers.Pi * 1024;
multipliers.Zi = multipliers.Ei * 1024;
multipliers.K = multipliers.B * 1000;
multipliers.M = multipliers.K * 1000;
multipliers.G = multipliers.M * 1000;
multipliers.T = multipliers.G * 1000;
multipliers.P = multipliers.T * 1000;
multipliers.E = multipliers.P * 1000;
multipliers.Z = multipliers.E * 1000;

const customUnits = {
  IS: [
    { from: 0, to: multipliers.Ki, unit: '' },
    { from: multipliers.Ki, to: multipliers.Mi, unit: 'Ki', long: 'thousand' },
    { from: multipliers.Mi, to: multipliers.Gi, unit: 'Mi', long: 'million' },
    { from: multipliers.Gi, to: multipliers.Ti, unit: 'Gi', long: 'billion' },
    { from: multipliers.Ti, unit: 'Ti', long: 'billion' },
  ],
};

export const bytesToIECBytes = (bytes: number, precision: number): ByteSizeResult => {
  return byteSize(bytes, {
    precision,
    customUnits,
    units: 'IS',
  });
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

    if (ISUnit?.length || bytesUnit?.length || decimalUnit?.length) {
      const bytes = value * multipliers[bytesUnit?.[0] || ISUnit?.[0] || decimalUnit?.[0]];

      byteSizeResult = bytesToIECBytes(bytes, precision);
    } else {
      byteSizeResult = bytesToIECBytes(value, precision);
    }
  }

  return [parseFloat(byteSizeResult.value), byteSizeResult.unit];
};
