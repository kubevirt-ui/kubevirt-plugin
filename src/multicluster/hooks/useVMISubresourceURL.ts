import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import useK8sBaseAPIPath from './useK8sBaseAPIPath';

const useVMISubresourceURL = (
  vmi: V1VirtualMachineInstance,
  subresource: string,
): [string, boolean] => {
  const [k8sAPIPath, k8sAPIPathLoaded] = useK8sBaseAPIPath(getCluster(vmi));

  const url = `${k8sAPIPath}/apis/subresources.${VirtualMachineInstanceModel.apiGroup}/${
    VirtualMachineInstanceModel.apiVersion
  }/namespaces/${getNamespace(vmi)}/${VirtualMachineInstanceModel.plural}/${getName(
    vmi,
  )}/${subresource}`;

  return [url, k8sAPIPathLoaded];
};

export default useVMISubresourceURL;
