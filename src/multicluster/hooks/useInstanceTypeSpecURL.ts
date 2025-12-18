import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import useK8sBaseAPIPath from './useK8sBaseAPIPath';

const useInstanceTypeSpecURL = (vm: V1VirtualMachine): [string, boolean] => {
  const [k8sAPIPath, k8sAPIPathLoaded] = useK8sBaseAPIPath(getCluster(vm));

  const url = `${k8sAPIPath}/apis/subresources.${VirtualMachineModel.apiGroup}/${
    VirtualMachineModel.apiVersion
  }/namespaces/${getNamespace(vm)}/${VirtualMachineModel.plural}/${getName(vm)}/expand-spec`;

  return [url, k8sAPIPathLoaded];
};

export default useInstanceTypeSpecURL;
