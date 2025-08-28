export enum BinaryUnit {
  B = 'B',
  Ei = 'Ei',
  Gi = 'Gi',
  Ki = 'Ki',
  Mi = 'Mi',
  Pi = 'Pi',
  Ti = 'Ti',
}

export enum DecimalUnit {
  B = 'B',
  E = 'E',
  G = 'G',
  k = 'k',
  M = 'M',
  P = 'P',
  T = 'T',
}

export type QuantityUnit = BinaryUnit | DecimalUnit;

export const binaryUnitsOrdered: BinaryUnit[] = [
  BinaryUnit.B,
  BinaryUnit.Ki,
  BinaryUnit.Mi,
  BinaryUnit.Gi,
  BinaryUnit.Ti,
  BinaryUnit.Pi,
  BinaryUnit.Ei,
];

export const decimalUnitsOrdered: DecimalUnit[] = [
  DecimalUnit.B,
  DecimalUnit.k,
  DecimalUnit.M,
  DecimalUnit.G,
  DecimalUnit.T,
  DecimalUnit.P,
  DecimalUnit.E,
];

export const decimalUnitsOrderedDescending = [...decimalUnitsOrdered].reverse();

export const multipliers: Record<string, number> = {};
multipliers.B = 1;
multipliers.Ki = multipliers.B * 1024;
multipliers.Mi = multipliers.Ki * 1024;
multipliers.Gi = multipliers.Mi * 1024;
multipliers.Ti = multipliers.Gi * 1024;
multipliers.Pi = multipliers.Ti * 1024;
multipliers.Ei = multipliers.Pi * 1024;
multipliers.K = multipliers.B * 1000;
multipliers.M = multipliers.K * 1000;
multipliers.G = multipliers.M * 1000;
multipliers.T = multipliers.G * 1000;
multipliers.P = multipliers.T * 1000;
multipliers.E = multipliers.P * 1000;

/** Matches alphabetic characters at the end of the string */
export const UNIT_REGEX = /[a-zA-Z]+$/;

/** Matches numeric characters (including decimal) at the start of the string */
export const NUMBER_REGEX = /^[0-9]*\.?[0-9]+/;

/** Matches exponential notation patterns */
export const EXPONENTIAL_REGEX = /^[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/;
