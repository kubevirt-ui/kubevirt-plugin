import type { TFunction } from 'i18next';

import { getCronScheduleFormatError } from '@kubevirt-utils/utils/validation';

export const getInvalidCronMessage = (t: TFunction): string => getCronScheduleFormatError(t);
