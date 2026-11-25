import { useWatch } from 'react-hook-form';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { BOOTABLE_VOLUME_SELECTED, logITFlowEvent } from '@kubevirt-utils/extensions/telemetry';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';
import {
  applySelectedBootableVolumeToForm,
  trackWizardPendingUploadKey,
} from '@virtualmachines/wizard/utils/utils';

export type AddBootableVolume = {
  canCreate: boolean;
  cluster?: string;
  lockedPreference?: PreferenceOption;
  namespace?: string;
  onCreateVolume: (volume: BootableVolume) => void;
  onSelectBootableVolume: OnSelectBootableVolume;
  onUploadStart: (uploadKey: string) => void;
};

const getAddVolumeNamespace = (
  volumeListNamespace: string | undefined,
  project: string | undefined,
): string | undefined => {
  if (volumeListNamespace && volumeListNamespace !== ALL_PROJECTS) {
    return volumeListNamespace;
  }
  return project ?? undefined;
};

const useAddBootableVolume = (): AddBootableVolume => {
  const { control, getValues, setValue } = useVMWizardForm();

  const [cluster, project, volumeListNamespace, guestOperatingSystem, preference] = useWatch({
    control,
    name: [
      'deployment.cluster',
      'deployment.project',
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

  const onSelectBootableVolume: OnSelectBootableVolume = (args) => {
    applyBootableVolume(args);
    logITFlowEvent(BOOTABLE_VOLUME_SELECTED, null, {
      selectedBootableVolume: getName(args.selectedVolume),
    });
  };

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
    canCreate,
    cluster,
    lockedPreference: preference ?? guestOperatingSystem ?? undefined,
    namespace: getAddVolumeNamespace(volumeListNamespace, project),
    onCreateVolume,
    onSelectBootableVolume,
    onUploadStart,
  };
};

export default useAddBootableVolume;
