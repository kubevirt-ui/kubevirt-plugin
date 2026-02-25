import { VMWizardState } from '@virtualmachines/creation-wizard/state/vm-wizard-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

export const initialVMWizardState: VMWizardState = {
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
    selectedSeries: '',
    selectedSize: '',
    volumeListNamespace: '',

    volumeSnapshotSource: null,
  },
  project: '',
  selectedTemplate: null,
  startVM: false,
};
