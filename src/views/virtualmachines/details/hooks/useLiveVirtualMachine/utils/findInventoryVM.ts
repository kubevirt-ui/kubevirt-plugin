import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

const findInventoryVM = (
  name: string,
  namespace: string,
  cluster?: string,
): V1VirtualMachine | undefined =>
  vmsSignal.value.find((candidate) => {
    if (getName(candidate) !== name || getNamespace(candidate) !== namespace) {
      return false;
    }

    if (!cluster) {
      return true;
    }

    return getCluster(candidate) === cluster;
  });

export default findInventoryVM;
