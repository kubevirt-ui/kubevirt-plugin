import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BulkSelectValue } from '@patternfly/react-component-groups';

type GetBulkSelectedVMsArgs = {
  currentPageVMs: V1VirtualMachine[];
  filteredVMs: V1VirtualMachine[];
  selectedVMs: V1VirtualMachine[];
  value: BulkSelectValue;
};

export const getBulkSelectedVMs = ({
  currentPageVMs,
  filteredVMs,
  selectedVMs,
  value,
}: GetBulkSelectedVMsArgs): V1VirtualMachine[] => {
  switch (value) {
    case BulkSelectValue.none:
      return [];
    case BulkSelectValue.nonePage:
      return selectedVMs.filter((vm) => !currentPageVMs.includes(vm));
    case BulkSelectValue.page:
      return currentPageVMs;
    case BulkSelectValue.all:
      return filteredVMs;
    default:
      return selectedVMs;
  }
};
