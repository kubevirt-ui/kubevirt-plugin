import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

const useGuestAgentURL = (vmi: V1VirtualMachineInstance): [string, boolean] => {
  const [k8sAPIPath, k8sAPIPathLoaded] = useFleetK8sAPIPath(getCluster(vmi));

  const url = `${k8sAPIPath}/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${
    VirtualMachineInstanceModel.apiVersion
  }/namespaces/${getNamespace(vmi)}/${VirtualMachineInstanceModel.plural}/${getName(
    vmi,
  )}/guestosinfo`;

  return [url, k8sAPIPathLoaded];
};

export default useGuestAgentURL;
