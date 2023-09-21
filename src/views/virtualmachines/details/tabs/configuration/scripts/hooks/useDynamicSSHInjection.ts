import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { getName } from '@kubevirt-utils/resources/shared';
import { getIsDynamicSSHInjectionEnabled } from '@kubevirt-utils/resources/vm';
import { getPVCSourceOrSourceRef } from '@kubevirt-utils/resources/vm/utils/source';

export const useDynamicSSHInjection = (vm: V1VirtualMachine) => {
  const { name, namespace } = getPVCSourceOrSourceRef(vm);
  const { bootableVolumes } = useBootableVolumes(namespace);
  const bootableVolume = bootableVolumes?.find((bv) => getName(bv) === name);
  const isDynamicSSHInjectionEnabled = getIsDynamicSSHInjectionEnabled(vm, bootableVolume);

  return isDynamicSSHInjectionEnabled;
};
