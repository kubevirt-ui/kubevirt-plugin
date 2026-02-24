import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import { deselectAllVMs, selectAllVMs } from '@virtualmachines/list/selectedVMs';

export const handleBulkSelect = (
  value: BulkSelectValue,
  vms: V1VirtualMachine[],
  currentPageVMs: V1VirtualMachine[],
) => {
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
    const currentPageVMsSet = new Set(currentPageVMs);

    selectAllVMs(vms.filter((vm) => !currentPageVMsSet.has(vm)));
  }
};
