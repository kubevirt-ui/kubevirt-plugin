import {
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
  addBootSourceState: {
    bootableVolume: { ...initialBootableVolumeState },
    sourceType: DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
    upload: null,
    uploadData: null,
  },
  cluster: '',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  folder: '',
  instanceTypeFlowState: {
    customDiskSize: '',
    dvSource: null,
    operatingSystemType: OperatingSystemType.RHEL,
    preference: '',
    pvcSource: null,
    selectedBootableVolume: null,
    selectedInstanceType: null,
    volumeListNamespace: '',
    volumeSnapshotSource: null,
  },
  project: '',
};
