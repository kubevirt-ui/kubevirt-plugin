import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { filterVMsByClusterAndNamespace } from '@virtualmachines/list/utils/utils';

import { vmsInventoryMetaSignal, vmsSignal } from '../utils/signals';

export type FleetVMInventoryResult = {
  error?: Error;
  hasInventory: boolean;
  isStale: boolean;
  loaded: boolean;
  refresh?: () => void;
  vms: V1VirtualMachine[];
};

/**
 * Reads the Fleet tree VM inventory published to `vmsSignal`.
 * Scope filtering is client-side so ACM list/Overview/filters share one Search poll.
 */
const useFleetVMInventory = (namespace?: string, cluster?: string): FleetVMInventoryResult => {
  useSignals();

  const { error, loaded, refresh } = vmsInventoryMetaSignal.value;
  const allVMs = vmsSignal.value;

  const vms = useMemo(
    () => filterVMsByClusterAndNamespace(allVMs, namespace, cluster),
    [allVMs, namespace, cluster],
  );

  const hasInventory = !isEmpty(vms);
  const isStale = Boolean(error && hasInventory);

  return {
    error,
    hasInventory,
    isStale,
    loaded: loaded || hasInventory,
    refresh,
    vms,
  };
};

export default useFleetVMInventory;
