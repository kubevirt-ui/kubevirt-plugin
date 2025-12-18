import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import { VM_FOLDER_LABEL } from '../utils/constants';
import { vmsSignal } from '../utils/signals';

export const getVMFromElementID = (elementID: string): V1VirtualMachine => {
  const [cluster, namespace, name] = elementID.split('/');

  return vmsSignal?.value?.find(
    (resource) =>
      getNamespace(resource) === namespace &&
      getName(resource) === name &&
      (getCluster(resource) === cluster || cluster === SINGLE_CLUSTER_KEY),
  );
};

export const isVMAloneInFolder = (draggingVM: V1VirtualMachine) => {
  const draggingVMFolder = getLabel(draggingVM, VM_FOLDER_LABEL);

  return (
    vmsSignal?.value?.filter((vm) => draggingVMFolder === getLabel(vm, VM_FOLDER_LABEL)).length ===
    1
  );
};
