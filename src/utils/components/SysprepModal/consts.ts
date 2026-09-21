import { ValidatedOptions } from '@patternfly/react-core';

import { type SysprepFile } from './types';

export const SYSPREP = 'sysprep';

export const EMPTY_SYSPREP_FILE: SysprepFile = {
  fileName: '',
  isLoading: false,
  validated: ValidatedOptions.default,
  value: '',
};
