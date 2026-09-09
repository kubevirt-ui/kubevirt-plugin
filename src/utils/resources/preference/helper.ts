import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachinePreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachinePreference,
  type V1PreferenceMatcher,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const getPreferredBootmode = (
  preference: V1beta1VirtualMachinePreference,
): BootMode | undefined => {
  if (
    preference?.spec?.firmware?.preferredUseSecureBoot ||
    preference?.spec?.firmware?.preferredEfi?.secureBoot
  )
    return BootMode.UefiSecure;
  if (
    preference?.spec?.firmware?.preferredUseEfi ||
    preference?.spec?.firmware?.preferredEfi?.secureBoot === false
  )
    return BootMode.UEFI;
  if (
    preference?.spec?.firmware?.preferredUseBios ||
    preference?.spec?.firmware?.preferredUseBiosSerial
  )
    return BootMode.BIOS;
};

export const getPreferenceModelFromMatcher = (preferenceMatcher: V1PreferenceMatcher): K8sModel =>
  preferenceMatcher?.kind === VirtualMachinePreferenceModel.kind
    ? VirtualMachinePreferenceModel
    : VirtualMachineClusterPreferenceModel;
