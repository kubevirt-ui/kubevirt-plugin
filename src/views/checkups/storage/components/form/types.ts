import { type SkipTeardownOption } from '../../utils/utils';

export type StorageCheckupAdvancedSettings = {
  numOfVMs: string;
  skipTeardown: SkipTeardownOption;
  storageClass: string;
  vmiTimeout: string;
};
