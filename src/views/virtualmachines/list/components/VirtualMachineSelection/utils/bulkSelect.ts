import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { deselectAll, deselectVM, selectAll } from '@virtualmachines/list/selectedVMs';

export const handleBulkSelect = (
  value: BulkSelectValue,
  vms: V1VirtualMachine[],
  currentPageVMs: V1VirtualMachine[],
) => {
  if (value === BulkSelectValue.none) {
    deselectAll();
    return;
  }

  if (value === BulkSelectValue.page) {
    selectAll(currentPageVMs);
    return;
  }

  if (value === BulkSelectValue.all) {
    selectAll(vms);
    return;
  }

  if (value === BulkSelectValue.nonePage) {
    currentPageVMs.forEach(deselectVM);
  }
};
