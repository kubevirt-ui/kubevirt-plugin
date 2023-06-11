export enum CAPACITY_UNITS {
  GiB = 'GiB',
  MiB = 'MiB',
  TiB = 'TiB',
}

export const removeByteSuffix = (quantity: string): string => quantity?.replace(/[Bb]/, '');
