import { type SetStateAction } from 'react';
import produce from 'immer';

import {
  ProcessedTemplatesModel,
  TemplateModel,
  type TemplateParameter,
  VirtualMachineTemplateModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1VirtualMachineTemplateSpecParameters } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { logTemplateEdited } from '@kubevirt-utils/extensions/telemetry/templates';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getParameters,
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const replaceTemplateParameters = (
  template: Template,
  parameters: TemplateParameter[] | V1alpha1VirtualMachineTemplateSpecParameters[],
): Template =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1alpha1VirtualMachineTemplateSpecParameters[];
  });

export const createTemplateDraft = (
  template: Template,
  namespace: string,
  parameters: TemplateParameter[] | V1alpha1VirtualMachineTemplateSpecParameters[],
): Template =>
  produce(template, (draftTemplate) => {
    if (isOpenShiftTemplate(draftTemplate)) draftTemplate.parameters = parameters;
    if (isVirtualMachineTemplate(draftTemplate))
      draftTemplate.spec.parameters = parameters as V1alpha1VirtualMachineTemplateSpecParameters[];

    draftTemplate.metadata = { ...draftTemplate.metadata, namespace };
  });

export const getTemplateModel = (template: Template): K8sModel =>
  isVirtualMachineTemplate(template) ? VirtualMachineTemplateModel : TemplateModel;

export const updateTemplate = async (template: Template): Promise<Template> => {
  const model = getTemplateModel(template);
  const result = await kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: template,
    model,
    name: getName(template),
    ns: getNamespace(template),
  });
  logTemplateEdited(template);
  return result;
};

export const createProcessedTemplate = <T extends Template>(
  template: T,
  cluster: string,
  namespace: string,
  excludedParameters: TemplateParameter[],
  setTemplateWithGeneratedValues: (value: SetStateAction<Template>) => void,
  setError: (value: SetStateAction<Error>) => void,
  setLoading: (value: SetStateAction<boolean>) => void,
): void => {
  kubevirtK8sCreate<T>({
    cluster,
    data: template,
    model: isOpenShiftTemplate(template)
      ? ProcessedTemplatesModel
      : VirtualMachineTemplateRequestModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  })
    .then((processedTemplate) => {
      const mergedParameters = [...(getParameters(processedTemplate) ?? []), ...excludedParameters];

      setTemplateWithGeneratedValues(replaceTemplateParameters(template, mergedParameters));
      setError(null);
      setLoading(false);
    })
    .catch((apiError) => {
      setTemplateWithGeneratedValues(template);
      setError(apiError);
      setLoading(false);
    });
};
