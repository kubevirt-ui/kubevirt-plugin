import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

export const patchVM = (vm: V1VirtualMachine, patches: Patch[]): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch<V1VirtualMachine>({
    cluster: getCluster(vm),
    data: patches,
    model: VirtualMachineModel,
    resource: vm,
  });
