import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { isVirtualMachineTemplate, Template } from '@kubevirt-utils/resources/template';
import { processOpenShiftTemplate } from '@kubevirt-utils/resources/template/utils/processOpenShiftTemplate';
import { processVirtualMachineTemplate } from '@kubevirt-utils/resources/template/utils/processVirtualMachineTemplate';
import { getDataVolumeSourceHTTP } from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { INSTALLATION_CDROM_NAME } from '@virtualmachines/creation-wizard-new/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

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
