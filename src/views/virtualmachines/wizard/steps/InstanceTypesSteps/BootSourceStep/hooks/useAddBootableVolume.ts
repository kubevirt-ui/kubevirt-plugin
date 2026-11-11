import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { getInstanceTypeFromVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';
import {
  applySelectedBootableVolumeToForm,
  trackWizardPendingUploadKey,
} from '@virtualmachines/wizard/utils/utils';

export type AddBootableVolume = {
  applyBootableVolume: OnSelectBootableVolume;
  canCreate: boolean;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  onUploadStart: (uploadKey: string) => void;
};

const useAddBootableVolume = (): AddBootableVolume => {
  const { control, getValues, setValue } = useVMWizardForm();

  const [cluster, volumeListNamespace, guestOperatingSystem, preference] = useWatch({
    control,
    name: [
      'deployment.cluster',
      'instanceType.volumeNamespace',
      'instanceType.guestOperatingSystem',
      'instanceType.preference',
    ],
  });
  const { isFamilyVisible, loaded: familiesLoaded } = useDisabledInstanceTypeFamilies(cluster);

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const applyBootableVolume: OnSelectBootableVolume = (args) => {
    applySelectedBootableVolumeToForm({
      ...args,
      familiesLoaded,
      isFamilyVisible,
      setValue,
    });
  };

  useEffect(() => {
    if (!familiesLoaded) {
      return;
    }

    const bootVolume = getValues('instanceType.bootVolume');
    if (!bootVolume?.volume) {
      return;
    }

    const instanceTypeName = getInstanceTypeFromVolume(bootVolume.volume) ?? '';
    const [series = '', size = ''] = instanceTypeName.split('.');
    if (!series || !size) {
      return;
    }

    const compute = getValues('instanceType.compute');
    const computeMatchesVolume = compute?.name === instanceTypeName;
    if (compute && !computeMatchesVolume) {
      return;
    }

    applySelectedBootableVolumeToForm({
      dvSource: bootVolume.dataVolumeSource,
      familiesLoaded: true,
      isFamilyVisible,
      pvcSource: bootVolume.persistentVolumeClaimSource,
      selectedVolume: bootVolume.volume,
      setValue,
      volumeSnapshotSource: bootVolume.volumeSnapshotSource,
    });
  }, [familiesLoaded, getValues, isFamilyVisible, setValue]);

  const onCreateVolume = (volume: BootableVolume): void => {
    applyBootableVolume({
      dvSource: null,
      pvcSource: null,
      selectedVolume: volume,
      volumeSnapshotSource: null,
    });
  };

  const onUploadStart = (uploadKey: string): void =>
    trackWizardPendingUploadKey(getValues, setValue, uploadKey);

  return {
    applyBootableVolume,
    canCreate,
    lockedPreference: preference ?? guestOperatingSystem ?? undefined,
    onCreateVolume,
    onUploadStart,
  };
};

export default useAddBootableVolume;
