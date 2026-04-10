import { InstanceTypeVMState } from '@virtualmachines/creation-wizard/state/instance-type-vm-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

export const initialInstanceTypeVMState: InstanceTypeVMState = {
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
};
