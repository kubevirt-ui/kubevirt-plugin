import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ProcessedTemplatesModel } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

export const processOpenShiftTemplate = async (
  template: Template,
  namespace: string,
  cluster: string,
): Promise<V1VirtualMachine> => {
  const processedTemplate = await kubevirtK8sCreate<Template>({
    cluster,
    data: { ...template, metadata: { ...template?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  });

  return getTemplateVirtualMachineObject(processedTemplate);
};
