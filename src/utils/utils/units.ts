enum BinaryUnit {
  B = 'B',
  Ki = 'Ki',
  Mi = 'Mi',
  Gi = 'Gi',
  Ti = 'Ti',
}

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

  return `${value} ${toIECUnit(unit)}`;
};
