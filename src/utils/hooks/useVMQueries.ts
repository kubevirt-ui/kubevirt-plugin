import { useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt/models';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

const useVMQueries = (
  vm: V1VirtualMachine | V1VirtualMachineInstance,
  launcherPodName?: string,
) => {
  const { duration } = useDuration();

  const [hubClusterName] = useHubClusterName();

  return useMemo(
    () =>
      getUtilizationQueries({
        duration,
        hubClusterName,
        launcherPodName,
        obj: vm,
      }),
    [duration, hubClusterName, launcherPodName, vm],
  );
};

export default useVMQueries;
