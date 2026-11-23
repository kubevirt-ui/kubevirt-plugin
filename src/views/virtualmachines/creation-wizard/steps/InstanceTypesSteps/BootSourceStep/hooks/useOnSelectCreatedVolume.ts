import { useCallback } from 'react';

import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import { InstanceTypeVMStore } from '@virtualmachines/creation-wizard/state/instance-type-vm-store/utils/types';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

/**
 * Wraps the store's `onSelectCreatedVolume` so that a bootable volume whose default instance type
 * family is disabled (or whose family availability has not loaded yet) does not preselect that family.
 */
const useOnSelectCreatedVolume = (): InstanceTypeVMStore['onSelectCreatedVolume'] => {
  const { cluster } = useVMWizardStore();
  const onSelectCreatedVolume = useInstanceTypeVMStore((state) => state.onSelectCreatedVolume);
  const { isFamilyVisible, loaded: familiesLoaded } = useDisabledInstanceTypeFamilies(cluster);

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
