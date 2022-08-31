export enum BinaryUnit {
  B = 'B',
  Ki = 'Ki',
  Mi = 'Mi',
  Gi = 'Gi',
  Ti = 'Ti',
}

export const multipliers: Record<string, number> = {};
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

export const customUnits = {
  IS: [
    { from: 0, to: multipliers.Ki, unit: 'B' },
    { from: multipliers.Ki, to: multipliers.Mi, unit: 'KiB', long: 'thousand' },
    { from: multipliers.Mi, to: multipliers.Gi, unit: 'MiB', long: 'million' },
    { from: multipliers.Gi, to: multipliers.Ti, unit: 'GiB', long: 'billion' },
    { from: multipliers.Ti, unit: 'TiB', long: 'billion' },
  ],
};

/**
 * A function to return unit for disk size/memory with 'B' suffix.
 * @param {BinaryUnit | string} unit - unit
 * @returns {string}
 */
export const toIECUnit = (unit: BinaryUnit | string): string =>
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
  return !value ? combinedStr : `${value} ${toIECUnit(unit)}`;
};
