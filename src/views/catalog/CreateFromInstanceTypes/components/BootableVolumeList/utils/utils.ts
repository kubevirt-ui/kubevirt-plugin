import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { PaginationState } from '@virtualmachines/utils';

import { DEFAULT_PREFERENCE_LABEL } from '../../../utils/constants';

import { paginationInitialStateForm } from './constants';

export const getBootVolumeOS = (bootVolume: V1beta1DataSource): OS_NAME_TYPES => {
  const bootVolumePreference = bootVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  return (
    Object.values(OS_NAME_TYPES).find((osName) => bootVolumePreference?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

export const getPaginationFromVolumeIndex =
  (volumeIndex: number) =>
  (prevPagination: PaginationState): PaginationState => {
    if (volumeIndex <= 0 || volumeIndex / prevPagination.perPage < 1) {
      return paginationInitialStateForm;
    }

    const perPage = prevPagination.perPage;
    const page = Math.floor(volumeIndex / perPage) + 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    return {
      page,
      perPage,
      startIndex,
      endIndex,
    };
  };
