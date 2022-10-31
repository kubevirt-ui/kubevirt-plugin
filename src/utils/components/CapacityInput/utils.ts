export enum CAPACITY_UNITS {
  MiB = 'MiB',
  GiB = 'GiB',
  TiB = 'TiB',
}

export const removeByteSuffix = (quantity: string): string => quantity?.replace(/[Bb]/, '');
