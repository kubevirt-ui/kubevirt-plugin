import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type VirtualMachinePreference =
  | V1beta1VirtualMachineClusterPreference
  | V1beta1VirtualMachinePreference;
