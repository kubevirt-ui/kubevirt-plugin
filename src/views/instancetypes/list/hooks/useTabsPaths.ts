import {
  VirtualMachineClusterInstancetypeModelRef,
  VirtualMachineInstancetypeModelRef,
} from '@kubevirt-utils/models';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { CLUSTER_INSTANCETYPE_TAB_INDEX, USER_INSTANCETYPE_TAB_INDEX } from '../constants';

const useTabsPaths = (): { [tabIndex: number]: string } => {
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const [activeNamespace] = useActiveNamespace();

  if (isACMPage) {
    const clusterPath = cluster ? `/cluster/${cluster}/` : '/all-clusters/';
    return {
      [CLUSTER_INSTANCETYPE_TAB_INDEX]: `/k8s${clusterPath}${VirtualMachineClusterInstancetypeModelRef}`,
      [USER_INSTANCETYPE_TAB_INDEX]: `/k8s${clusterPath}all-namespaces/${VirtualMachineInstancetypeModelRef}`,
    };
  }

  return {
    [CLUSTER_INSTANCETYPE_TAB_INDEX]: `/k8s/cluster/${VirtualMachineClusterInstancetypeModelRef}`,
    [USER_INSTANCETYPE_TAB_INDEX]: isAllNamespaces(activeNamespace)
      ? `/k8s/all-namespaces/${VirtualMachineInstancetypeModelRef}`
      : `/k8s/ns/${activeNamespace}/${VirtualMachineInstancetypeModelRef}`,
  };
};

export default useTabsPaths;
