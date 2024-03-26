import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateAnnotations } from '@kubevirt-utils/resources/vm';

export const isCreatedFromTemplate = (vm: V1VirtualMachine): boolean =>
  Object.keys(getTemplateAnnotations(vm))?.some((key) => key === 'vm.kubevirt.io/flavor');
