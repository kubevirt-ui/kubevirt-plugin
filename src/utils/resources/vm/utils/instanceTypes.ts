import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const isInstanceTypeVM = (vm: V1VirtualMachine): boolean =>
  !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference);
