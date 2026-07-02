import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ProcessedTemplatesModel } from '@kubevirt-utils/models';
import {
  getTemplateVirtualMachineObject,
  NAME_PARAMETER,
  Template,
} from '@kubevirt-utils/resources/template';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

const applyNameParameter = (template: V1Template, vmName?: string): V1Template => {
  if (!vmName || !template.parameters) return template;

  return {
    ...template,
    parameters: template.parameters.map((param) =>
      param.name === NAME_PARAMETER ? { ...param, value: vmName } : param,
    ),
  };
};

export const processOpenShiftTemplate = async (
  template: V1Template,
  namespace: string,
  cluster: string,
  vmName?: string,
): Promise<V1VirtualMachine> => {
  const templateWithName = applyNameParameter(template, vmName);

  const processedTemplate = await kubevirtK8sCreate<Template>({
    cluster,
    data: { ...templateWithName, metadata: { ...templateWithName?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  });

  const virtualMachine = getTemplateVirtualMachineObject(processedTemplate);

  if (cluster) {
    virtualMachine.cluster = cluster;
  }

  return virtualMachine;
};
