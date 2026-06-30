import { produce } from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  isVirtualMachineTemplate,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  Template,
} from '@kubevirt-utils/resources/template';
import { processOpenShiftTemplate } from '@kubevirt-utils/resources/template/utils/processOpenShiftTemplate';
import { processVirtualMachineTemplate } from '@kubevirt-utils/resources/template/utils/processVirtualMachineTemplate';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm';
import { getDataVolumeSourceHTTP } from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { INSTALLATION_CDROM_NAME } from '@virtualmachines/creation-wizard-new/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export const resolveVMFromTemplate = (
  selectedTemplate: Template,
  namespace: string,
  cluster: string,
  vmName?: string,
): Promise<V1VirtualMachine> => {
  if (isVirtualMachineTemplate(selectedTemplate)) {
    return processVirtualMachineTemplate(selectedTemplate, cluster, vmName);
  }

  return processOpenShiftTemplate(selectedTemplate, namespace, cluster, vmName);
};

export const applyCertConfigMapToCDRom = (
  vmObject: V1VirtualMachine,
  certConfigMapName: string | undefined,
) => {
  if (!certConfigMapName) return;

  const cdromDVTemplate = vmObject.spec?.dataVolumeTemplates?.find(
    (dvt) => getName(dvt).endsWith(INSTALLATION_CDROM_NAME) && getDataVolumeSourceHTTP(dvt),
  );

  if (cdromDVTemplate) {
    cdromDVTemplate.spec.source.http.certConfigMap = certConfigMapName;
  }
};

export const getVMObjectFromTemplate = ({
  description,
  folder,
  namespace,
  selectedTemplate,
  vm,
  vmName,
}: {
  description: string;
  folder: string;
  namespace: string;
  selectedTemplate: null | Template;
  vm: V1VirtualMachine;
  vmName?: string;
}) =>
  produce(vm, (draftVM) => {
    if (!isEmpty(description)) {
      draftVM.metadata.annotations.description = description;
    }

    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = selectedTemplate?.metadata?.name;
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = selectedTemplate?.metadata?.namespace;

    if (folder) {
      draftVM.metadata.labels[VM_FOLDER_LABEL] = folder;
    }

    draftVM.metadata.name = vmName || getName(draftVM) || draftVM.metadata.labels?.app;
    draftVM.metadata.namespace = namespace;
    draftVM.spec.runStrategy = getDefaultRunningStrategy();
  });
