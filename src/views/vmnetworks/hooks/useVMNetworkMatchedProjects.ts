import useProjectResources from '@kubevirt-utils/hooks/useProjectResources';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getVMNetworkProjects } from '../utils';

const useVMNetworkMatchedProjects = (
  vmNetwork: ClusterUserDefinedNetworkKind,
): [matchingProjects: K8sResourceCommon[], loaded: boolean, error: Error] => {
  const [projects, loaded, error] = useProjectResources();

  const matchingProjects = getVMNetworkProjects(vmNetwork, projects);

  return [matchingProjects, loaded, error];
};

export default useVMNetworkMatchedProjects;
