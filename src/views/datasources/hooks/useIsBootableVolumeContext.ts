import { useSearchParams } from 'react-router';

import {
  appendBootableVolumeContext,
  BOOTABLE_VOLUMES_CONTEXT_PARAM,
  FROM_QUERY_PARAM,
} from '@kubevirt-utils/resources/bootableresources/constants';

export { appendBootableVolumeContext, BOOTABLE_VOLUMES_CONTEXT_PARAM };

const useIsBootableVolumeContext = (): boolean => {
  const [searchParams] = useSearchParams();
  return searchParams.get(FROM_QUERY_PARAM) === BOOTABLE_VOLUMES_CONTEXT_PARAM;
};

export default useIsBootableVolumeContext;
