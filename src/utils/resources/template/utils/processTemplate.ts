import { type SetStateAction } from 'react';

import {
  ProcessedTemplatesModel,
  type TemplateParameter,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  getParameters,
  isOpenShiftTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { replaceTemplateParameters } from './helpers';

export const createProcessedTemplate = <T extends Template>(
  template: T,
  cluster: string,
  namespace: string,
  excludedParameters: TemplateParameter[],
  setTemplateWithGeneratedValues: (value: SetStateAction<Template>) => void,
  setError: (value: SetStateAction<Error | null>) => void,
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
    .catch((apiError: unknown) => {
      setTemplateWithGeneratedValues(template);
      setError(apiError instanceof Error ? apiError : new Error(String(apiError)));
      setLoading(false);
    });
};
