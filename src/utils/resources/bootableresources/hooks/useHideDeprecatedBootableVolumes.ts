import { useEffect } from 'react';

import { SHOW_DEPRECATED_BOOTABLE_VOLUMES } from '@kubevirt-utils/resources/bootableresources/constants';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';

type UseHideDeprecatedBootableVolumes = (onFilterChange: OnFilterChange) => void;

const useHideDeprecatedBootableVolumes: UseHideDeprecatedBootableVolumes = (onFilterChange) => {
  useEffect(() => {
    // Calculate the filtered bootable volumes once causing deprecated volumes to be hidden by default
    onFilterChange(SHOW_DEPRECATED_BOOTABLE_VOLUMES, {
      all: [],
      selected: [],
    });
  }, [onFilterChange]);
};

export default useHideDeprecatedBootableVolumes;
