import { InstanceTypeVMState } from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/utils/types';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

export const initialInstanceTypeVMState: InstanceTypeVMState = {
  customDiskSize: '',
  dvSource: null,
  operatingSystemType: OperatingSystemType.RHEL,
  preference: null,
  pvcSource: null,
  selectedBootableVolume: null,
  selectedInstanceType: null,
  selectedSeries: '',
  selectedSize: '',
  useBootSource: true,
  volumeListNamespace: '',
  volumeSnapshotSource: null,
};
