import { useCallback, useEffect, useMemo, useState } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useSignals } from '@preact/signals-react/runtime';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

type UseLiveVirtualMachineArgs = {
  cluster?: string;
  isACMPage: boolean;
  name: string;
  namespace: string;
  skipWatch: boolean;
};

type UseLiveVirtualMachineResult = {
  error?: Error;
  isLoaded: boolean;
  isSoftError: boolean;
  isUsingFallback: boolean;
  retry: () => void;
  vm?: V1VirtualMachine;
};

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

/**
 * Live named-VM watch for the details page.
 * On ACM, soft watch failures fall back to a matching Fleet tree inventory VM.
 */
const useLiveVirtualMachine = ({
  cluster,
  isACMPage,
  name,
  namespace,
  skipWatch,
}: UseLiveVirtualMachineArgs): UseLiveVirtualMachineResult => {
  useSignals();
  const [suspendLiveWatch, setSuspendLiveWatch] = useState(false);

  useEffect(() => {
    if (!suspendLiveWatch) {
      return;
    }
    const frame = requestAnimationFrame(() => setSuspendLiveWatch(false));
    return (): void => cancelAnimationFrame(frame);
  }, [suspendLiveWatch]);

  const retry = useCallback(() => {
    setSuspendLiveWatch(true);
  }, []);

  const [liveVM, isLoaded, loadError] = useK8sWatchData<V1VirtualMachine>(
    skipWatch || suspendLiveWatch
      ? null
      : {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          name,
          namespace,
        },
  );

  const inventoryVM = useMemo(
    () => (isACMPage ? findInventoryVM(name, namespace, cluster) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when inventory signal changes
    [isACMPage, name, namespace, cluster, vmsSignal.value],
  );

  const isSoftError = Boolean(isACMPage && loadError && !isHardInventoryError(loadError));
  const isUsingFallback = Boolean(isSoftError && !liveVM && inventoryVM);
  const vm = liveVM ?? (isSoftError ? inventoryVM : undefined);

  return {
    error: loadError,
    isLoaded,
    isSoftError,
    isUsingFallback,
    retry,
    vm,
  };
};

export default useLiveVirtualMachine;
