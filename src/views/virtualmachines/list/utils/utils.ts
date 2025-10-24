import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

export const filterVMsByClusterAndNamespace = (
  vms: V1VirtualMachine[],
  namespaces: string[],
  clusters: string[],
) =>
  vms.filter((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmCluster = getCluster(vm);

    return (
      (!isEmpty(clusters) && clusters.includes(vmCluster)) ||
      (!isEmpty(namespaces) && namespaces.includes(vmNamespace))
    );
  });
