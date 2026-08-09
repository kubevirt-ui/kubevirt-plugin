import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { deselectAllVMs, deselectVM, selectAllVMs } from '@virtualmachines/list/selectedVMs';

export const handleBulkSelect = (
  value: BulkSelectValue,
  vms: V1VirtualMachine[],
  currentPageVMs: V1VirtualMachine[],
): void => {
  if (value === BulkSelectValue.none) {
    deselectAllVMs();
    return;
  }

  if (value === BulkSelectValue.page) {
    selectAllVMs(currentPageVMs);
    return;
  }

  if (value === BulkSelectValue.all) {
    selectAllVMs(vms);
    return;
  }

  if (value === BulkSelectValue.nonePage) {
    for (const vm of currentPageVMs) deselectVM(vm);
  }
};
