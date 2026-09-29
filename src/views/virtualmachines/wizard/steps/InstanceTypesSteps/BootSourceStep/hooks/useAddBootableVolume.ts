import { useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

export type AddBootableVolume = {
  canCreate: boolean;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  onUploadStart: (uploadKey: string) => void;
};

const useAddBootableVolume = (): AddBootableVolume => {
  const { control, getValues, setValue } = useVMWizard();

  const [volumeListNamespace, preference] = useWatch({
    control,
    name: ['instanceType.volumeNamespace', 'instanceType.preference'],
  });

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const onCreateVolume = (volume: BootableVolume): void => {
    applySelectedBootableVolumeToForm({
      dvSource: null,
      getValues,
      pvcSource: null,
      selectedVolume: volume,
      setValue,
      volumeSnapshotSource: null,
    });
  };

  const onUploadStart = (uploadKey: string): void => {
    const keys = getValues('customization.pendingBootableVolumeUploadKeys');
    if (!keys.includes(uploadKey))
      setValue('customization.pendingBootableVolumeUploadKeys', [...keys, uploadKey]);
  };

  return {
    canCreate,
    lockedPreference: preference ?? undefined,
    onCreateVolume,
    onUploadStart,
  };
};

export default useAddBootableVolume;
