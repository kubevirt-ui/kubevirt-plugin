import { useWatch } from 'react-hook-form';

import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

export type AddBootableVolume = {
  canCreate: boolean;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
};

const useAddBootableVolume = (): AddBootableVolume => {
  const { control, getValues, setValue } = useVMWizard();

  const [volumeListNamespace, preference] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
    ],
  });

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const onCreateVolume = (volume: BootableVolume) =>
    applySelectedBootableVolumeToForm({
      dvSource: null,
      getValues,
      pvcSource: null,
      selectedVolume: volume,
      setValue,
      volumeSnapshotSource: null,
    });

  return {
    canCreate,
    lockedPreference: preference ?? undefined,
    onCreateVolume,
  };
};

export default useAddBootableVolume;
