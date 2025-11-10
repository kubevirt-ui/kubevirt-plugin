import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';

export const filterVMsByNamespace = (vms: V1VirtualMachine[], namespace: string) =>
  vms.filter((vm) => {
    const vmNamespace = getNamespace(vm);

    if (namespace && namespace !== vmNamespace) return false;

    return true;
  });
