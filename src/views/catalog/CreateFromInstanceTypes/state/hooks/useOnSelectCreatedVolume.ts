import { useCallback } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { InstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';

/**
 * Wraps the store's `onSelectCreatedVolume` so that a bootable volume whose default instance type
 * family is disabled (or whose family availability has not loaded yet) does not preselect that family.
 */
const useOnSelectCreatedVolume = (): InstanceTypeVMStore['onSelectCreatedVolume'] => {
  const onSelectCreatedVolume = useInstanceTypeVMStore((state) => state.onSelectCreatedVolume);
  const { isFamilyVisible, loaded: familiesLoaded } = useDisabledInstanceTypeFamilies();

  return useCallback(
    (selectedVolume, pvcSource, volumeSnapshotSource, dvSource) =>
      onSelectCreatedVolume(selectedVolume, pvcSource, volumeSnapshotSource, dvSource, {
        familiesLoaded,
        isFamilyVisible,
      }),
    [familiesLoaded, isFamilyVisible, onSelectCreatedVolume],
  );
};

export default useOnSelectCreatedVolume;
