import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sSelectionId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { getBulkSelectedItems } from '@kubevirt-utils/components/KubevirtTable/utils/getBulkSelectedItems';
import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { deselectAllVMs, selectAllVMs } from '@virtualmachines/list/selectedVMs';

export const handleBulkSelect = (
  value: BulkSelectValue,
  vms: V1VirtualMachine[],
  currentPageVMs: V1VirtualMachine[],
  selectedVMs: V1VirtualMachine[],
): void => {
  if (value === BulkSelectValue.none) {
    deselectAllVMs();
    return;
  }

  selectAllVMs(
    getBulkSelectedItems({
      allItems: vms,
      currentPageItems: currentPageVMs,
      getItemId: getK8sSelectionId,
      selectedItems: selectedVMs,
      value,
    }),
  );
};
