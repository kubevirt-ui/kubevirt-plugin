import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

export const updateVM = (vm: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sUpdate<V1VirtualMachine>({
    cluster: getCluster(vm),
    data: vm,
    model: VirtualMachineModel,
    name: getName(vm),
    ns: getNamespace(vm),
  });
