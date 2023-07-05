import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

export const getRandomVMName = (osName: string) =>
  `${osName}-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
