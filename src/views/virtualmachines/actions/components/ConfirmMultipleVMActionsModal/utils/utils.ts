import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

export const getVMNamesByNamespace = (vms: V1VirtualMachine[]): { [key: string]: string[] } =>
  vms?.reduce((acc: { [key: string]: string[] }, vm) => {
    const vmName = getName(vm);
    const vmNamespace = getNamespace(vm);
    const existingNames = acc?.[vmNamespace] || [];
    acc[vmNamespace] = [vmName, ...existingNames];
    return acc;
  }, {});
