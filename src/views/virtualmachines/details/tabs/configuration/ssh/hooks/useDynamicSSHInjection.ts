import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { getName } from '@kubevirt-utils/resources/shared';
import { getIsDynamicSSHInjectionEnabled } from '@kubevirt-utils/resources/vm';
import { getPVCSourceOrSourceRef } from '@kubevirt-utils/resources/vm/utils/source';

export const useDynamicSSHInjection = (vm: V1VirtualMachine): boolean => {
  const { name, namespace } = getPVCSourceOrSourceRef(vm);
  const { bootableVolumes } = useBootableVolumes(namespace);
  const bootableVolume = bootableVolumes?.find((volume) => getName(volume) === name);
  const isDynamicSSHInjectionEnabled = getIsDynamicSSHInjectionEnabled(vm, bootableVolume);

  return isDynamicSSHInjectionEnabled;
};
