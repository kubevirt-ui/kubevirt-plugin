import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { generateVMName } from '@kubevirt-utils/resources/template';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const getVMName = async (template: V1Template, namespace: string): Promise<string> => {
  const templateToProcess: V1Template = {
    ...template,
    parameters: template.parameters.filter((parameter) => !parameter.required),
  };

  return await k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: templateToProcess,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  }).then(
    (simpleProcessedTemplate) =>
      simpleProcessedTemplate?.parameters?.find((obj: { name: string }) => obj?.name === 'NAME')
        ?.value || generateVMName(template),
  );
};
