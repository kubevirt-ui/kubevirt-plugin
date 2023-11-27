import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { DEFAULT_PREFERENCE_LABEL } from '../../../utils/constants';

export const getBootVolumeOS = (bootVolume: BootableVolume): OS_NAME_TYPES => {
  const bootVolumePreference = bootVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  return (
    Object.values(OS_NAME_TYPES).find((osName) => bootVolumePreference?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

export const getPaginationFromVolumeIndex =
  (volumeIndex: number) =>
  (prevPagination: PaginationState): PaginationState => {
    if (volumeIndex < 0) {
      return prevPagination;
    }

    const perPage = prevPagination.perPage;
    const page = Math.floor(volumeIndex / perPage) + 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    return {
      endIndex,
      page,
      perPage,
      startIndex,
    };
  };
