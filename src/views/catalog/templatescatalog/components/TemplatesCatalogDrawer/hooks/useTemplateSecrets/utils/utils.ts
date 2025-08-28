import { TemplateSSHDetails } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useTemplateSecrets/utils/types';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';

export const getTemplateSSHSecret = (template: V1Template): TemplateSSHDetails => {
  const templateVM = getTemplateVirtualMachineObject(template);
  return {
    templateSecretName: getVMSSHSecretName(templateVM) || '',
    templateSecretNamespace: getNamespace(template) || '',
  };
};
