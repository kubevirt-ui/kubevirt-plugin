import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

export const getRandomVMName = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  });
