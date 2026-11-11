import { useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

export type AddBootableVolume = {
  canCreate: boolean;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
};

const useAddBootableVolume = (): AddBootableVolume => {
  const { control, getValues, setValue } = useVMWizard();

  const [cluster, volumeListNamespace, preference] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
    ],
  });
  const { isFamilyVisible, loaded: familiesLoaded } = useDisabledInstanceTypeFamilies(cluster);

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const onCreateVolume = (volume: BootableVolume): void =>
    applySelectedBootableVolumeToForm({
      dvSource: null,
      familiesLoaded,
      getValues,
      isFamilyVisible,
      pvcSource: null,
      selectedVolume: volume,
      setValue,
      volumeSnapshotSource: null,
    });

  return {
    canCreate,
    lockedPreference: preference as PreferenceOption | undefined,
    onCreateVolume,
  };
};

export default useAddBootableVolume;
