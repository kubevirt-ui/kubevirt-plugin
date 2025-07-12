import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

const useInstanceTypeSpecURL = (vm: V1VirtualMachine): [string, boolean] => {
  const [k8sAPIPath, k8sAPIPathLoaded] = useFleetK8sAPIPath(getCluster(vm));

  const url = `${k8sAPIPath}/apis/subresources.${VirtualMachineModel.apiGroup}/${
    VirtualMachineModel.apiVersion
  }/namespaces/${getNamespace(vm)}/${VirtualMachineModel.plural}/${getName(vm)}/expand-spec`;

  return [url, k8sAPIPathLoaded];
};

export default useInstanceTypeSpecURL;
