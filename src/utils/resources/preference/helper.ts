import VirtualMachineClusterPreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import VirtualMachinePreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import {
  V1beta1VirtualMachinePreference,
  V1PreferenceMatcher,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const getPreferredBootmode = (preference: V1beta1VirtualMachinePreference) => {
  if (
    preference?.spec?.firmware?.preferredUseSecureBoot ||
    preference?.spec?.firmware?.preferredEfi?.secureBoot
  )
    return BootMode.uefiSecure;
  if (
    preference?.spec?.firmware?.preferredUseEfi ||
    preference?.spec?.firmware?.preferredEfi?.secureBoot === false
  )
    return BootMode.uefi;
  if (
    preference?.spec?.firmware?.preferredUseBios ||
    preference?.spec?.firmware?.preferredUseBiosSerial
  )
    return BootMode.bios;
};

export const getPreferenceModelFromMatcher = (preferenceMatcher: V1PreferenceMatcher): K8sModel =>
  preferenceMatcher?.kind === VirtualMachinePreferenceModel.kind
    ? VirtualMachinePreferenceModel
    : VirtualMachineClusterPreferenceModel;
