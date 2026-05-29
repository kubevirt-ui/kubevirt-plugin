import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
  Template,
} from '@kubevirt-utils/resources/template';
import { mountWinDriversToVM } from '@kubevirt-utils/resources/vm/utils/disk/drivers';

export const mountWinDriversToTemplate = async (template: Template): Promise<Template> => {
  const virtualMachine = getTemplateVirtualMachineObject(template);

  const newVM = await mountWinDriversToVM(virtualMachine);

  return replaceTemplateVM(template, newVM);
};
