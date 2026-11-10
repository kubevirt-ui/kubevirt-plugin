import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { isHardInventoryError } from './isHardInventoryError';
import { vmsInventoryMetaSignal, vmsSignal } from './signals';

type UpdateFleetVMInventoryArgs = {
  error?: Error;
  loaded: boolean;
  refresh?: () => void;
  vms: V1VirtualMachine[];
};

/**
 * Publishes Fleet tree VM inventory for ACM list/Overview/filter reuse.
 * Successful loads replace inventory. Soft refresh failures keep the last
 * successful inventory for the current tree scope so consumers can show stale UI.
 */
export const updateFleetVMInventory = ({
  error,
  loaded,
  refresh,
  vms,
}: UpdateFleetVMInventoryArgs): void => {
  const hardError = error && isHardInventoryError(error) ? error : undefined;
  const softError = error && !hardError ? error : undefined;
  const hasRetainedInventory = !isEmpty(vmsSignal.value);

  if (hardError) {
    vmsSignal.value = [];
    vmsInventoryMetaSignal.value = { error: hardError, loaded: true, refresh };
    return;
  }

  if (loaded && !softError) {
    vmsSignal.value = vms;
    vmsInventoryMetaSignal.value = { loaded: true, refresh };
    return;
  }

  if (softError) {
    vmsInventoryMetaSignal.value = {
      error: softError,
      loaded: hasRetainedInventory || loaded,
      refresh,
    };
    return;
  }

  if (!loaded) {
    vmsInventoryMetaSignal.value = {
      loaded: false,
      refresh,
    };
  }
};
