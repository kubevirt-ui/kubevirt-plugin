import {
  DESCHEDULER_ENABLED,
  DESCHEDULER_NOT_ENABLED,
  DESCHEDULER_NOT_INSTALLED,
  DESCHEDULER_UNKNOWN,
} from '@kubevirt-utils/hooks/constants';
import { DeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerInstalled';

type GetDeschedulerStatusParams = {
  hasSubscription: boolean;
  isDeschedulerInstalled: boolean;
  loaded: boolean;
};

export const getDeschedulerStatus = ({
  hasSubscription,
  isDeschedulerInstalled,
  loaded,
}: GetDeschedulerStatusParams): DeschedulerStatus => {
  if (!loaded) return DESCHEDULER_UNKNOWN;
  if (!hasSubscription) return DESCHEDULER_NOT_INSTALLED;
  if (!isDeschedulerInstalled) return DESCHEDULER_NOT_ENABLED;
  return DESCHEDULER_ENABLED;
};
