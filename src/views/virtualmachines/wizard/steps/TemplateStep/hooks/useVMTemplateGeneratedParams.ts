import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  createTemplateDraft,
  getParameters,
  isVirtualMachineTemplate,
  processOpenShiftTemplate,
  replaceTemplateParameters,
  Template,
} from '@kubevirt-utils/resources/template';
import { generateParamsWithPrettyName } from '@kubevirt-utils/resources/template/utils/helpers';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';

const useVMTemplateGeneratedParams = (
  template: Template,
  namespaceOverride?: string,
): [template: Template, loading: boolean, error: Error] => {
  const cluster = useClusterParam();
  const [error, setError] = useState<Error>();
  const { ns: nsFromParams = DEFAULT_NAMESPACE } = useParams<{ ns: string }>();
  const namespace = namespaceOverride || nsFromParams;
  const [templateWithGeneratedValues, setTemplateWithGeneratedValues] = useState<Template>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!template) return;
    const parameters = generateParamsWithPrettyName(template);
    const { excludedParameters, parametersToGenerate } = parameters.reduce(
      (acc, parameter) => {
        if (parameter?.generate) {
          acc.parametersToGenerate.push(parameter);
          return acc;
        }

        acc.excludedParameters.push(parameter);
        return acc;
      },
      { excludedParameters: [], parametersToGenerate: [] },
    );

    // VirtualMachineTemplates are processed on Next, not on selection.
    if (isEmpty(parametersToGenerate) || isVirtualMachineTemplate(template)) {
      setError(null);
      setLoading(false);
      setTemplateWithGeneratedValues(replaceTemplateParameters(template, parameters));
      return;
    }

    setLoading(true);
    const templateDraft = createTemplateDraft(template, namespace, parametersToGenerate);

    processOpenShiftTemplate(templateDraft as V1Template, namespace, cluster)
      .then((processedTemplate) => {
        const mergedParameters = [
          ...(getParameters(processedTemplate) ?? []),
          ...excludedParameters,
        ];

        setTemplateWithGeneratedValues(replaceTemplateParameters(templateDraft, mergedParameters));
        setError(null);
        setLoading(false);
      })
      .catch((apiError: Error) => {
        setTemplateWithGeneratedValues(templateDraft);
        setError(apiError);
        setLoading(false);
      });
  }, [namespace, template, cluster]);

  return [templateWithGeneratedValues, loading, error];
};

export default useVMTemplateGeneratedParams;
