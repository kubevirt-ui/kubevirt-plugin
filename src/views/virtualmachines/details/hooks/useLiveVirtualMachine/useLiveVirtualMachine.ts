import { useCallback, useEffect, useMemo, useState } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useSignals } from '@preact/signals-react/runtime';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

import findInventoryVM from './utils/findInventoryVM';

type UseLiveVirtualMachineArgs = {
  cluster?: string;
  isACMPage: boolean;
  name: string;
  namespace: string;
};

type UseLiveVirtualMachineResult = {
  error?: Error;
  isLoaded: boolean;
  isSoftError: boolean;
  isTourRunning: boolean;
  isUsingFallback: boolean;
  retry: () => void;
  vm?: V1VirtualMachine;
};

/**
 * Resolves the VM displayed on the details page from the guided tour, a live named-VM watch,
 * or, on ACM after a soft watch failure, the matching Fleet tree inventory VM.
 */
const useLiveVirtualMachine = ({
  cluster,
  isACMPage,
  name,
  namespace,
}: UseLiveVirtualMachineArgs): UseLiveVirtualMachineResult => {
  useSignals();
  const isTourRunning = runningTourSignal.value;
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
    isTourRunning || suspendLiveWatch
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
  const resourceVM = liveVM ?? (isSoftError ? inventoryVM : undefined);
  const vm = isTourRunning ? tourGuideVM : resourceVM;

  return {
    error: loadError,
    isLoaded,
    isSoftError,
    isTourRunning,
    isUsingFallback,
    retry,
    vm,
  };
};

export default useLiveVirtualMachine;
