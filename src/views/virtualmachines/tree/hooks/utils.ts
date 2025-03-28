import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { vmsSignal } from '../utils/signals';

export const getVMFromElementID = (elementID: string): V1VirtualMachine => {
  const [namespace, name] = elementID.split('/');

  return vmsSignal?.value?.find(
    (resource) => getNamespace(resource) === namespace && getName(resource) === name,
  );
};
