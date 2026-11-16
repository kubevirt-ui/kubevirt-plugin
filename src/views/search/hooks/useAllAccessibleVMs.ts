import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useSignals } from '@preact/signals-react/runtime';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

/**
 * Returns every VM accessible to the user, unscoped by the current URL cluster/namespace.
 *
 * Reads the fleet/tree VM inventory signal that VirtualMachineNavigator populates
 * unconditionally through useTreeViewData (works for both ACM and non-ACM).
 *
 * The advanced search modal relies on this complete set so its dropdowns
 * (projects, labels, storage classes, architectures, ...) list every option.
 *
 * NOTE: this depends on the VM tree being mounted. Do not use in contexts without the VM tree, or the signal may be empty/stale.
 */
const useAllAccessibleVMs = (): V1VirtualMachine[] => {
  useSignals();

  return vmsSignal.value;
};

export default useAllAccessibleVMs;
