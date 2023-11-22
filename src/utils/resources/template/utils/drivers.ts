import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { mountWinDriversToVM } from '@kubevirt-utils/resources/vm/utils/disk/drivers';

export const mountWinDriversToTemplate = async (template: V1Template): Promise<V1Template> => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  const newVM = await mountWinDriversToVM(virtualMachine);

  return replaceTemplateVM(template, newVM);
};
