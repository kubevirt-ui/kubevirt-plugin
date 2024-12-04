import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const getVMIOwner = (resource: K8sResourceCommon) =>
  resource?.metadata?.ownerReferences?.find(
    (owner) => owner.kind === VirtualMachineInstanceModel.kind,
  );

export const getVMNamesFromPodsNames = (pods: IoK8sApiCoreV1Pod[]) => {
  return pods?.reduce((acc, pod) => {
    const vmiOwner = getVMIOwner(pod);

    if (!vmiOwner) return acc;

    acc[`${getNamespace(pod)}-${getName(pod)}`] = vmiOwner.name;

    return acc;
  }, {});
};
