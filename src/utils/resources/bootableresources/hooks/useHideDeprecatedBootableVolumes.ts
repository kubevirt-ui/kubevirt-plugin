import { useEffect } from 'react';

import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import { SHOW_DEPRECATED_BOOTABLE_VOLUMES } from '@kubevirt-utils/resources/bootableresources/constants';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';

type UseHideDeprecatedBootableVolumes = (
  onFilterChange: OnFilterChange,
  currentTab?: CREATE_VM_TAB,
) => void;

const useHideDeprecatedBootableVolumes: UseHideDeprecatedBootableVolumes = (
  onFilterChange,
  currentTab,
) => {
  useEffect(() => {
    if (currentTab !== CREATE_VM_TAB.INSTANCE_TYPES && currentTab !== undefined) return null;

    // Calculate the filtered bootable volumes once causing deprecated volumes to be hidden by default
    onFilterChange(SHOW_DEPRECATED_BOOTABLE_VOLUMES, {
      all: [],
      selected: [],
    });
  }, [currentTab, onFilterChange]);
};

export default useHideDeprecatedBootableVolumes;
