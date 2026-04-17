import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  createProcessedTemplate,
  createTemplateDraft,
  replaceTemplateParameters,
  Template,
} from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { generateParamsWithPrettyName } from './../utils/helpers';

const useVMTemplateGeneratedParams = (
  template: Template,
): [template: Template, loading: boolean, error: Error] => {
  const cluster = useClusterParam();
  const [error, setError] = useState<Error>();
  const { ns: namespace = DEFAULT_NAMESPACE } = useParams<{ ns: string }>();
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

    if (isEmpty(parametersToGenerate)) {
      setError(null);
      setTemplateWithGeneratedValues(replaceTemplateParameters(template, parameters));
      return;
    }

    setLoading(true);
    const templateDraft = createTemplateDraft(template, namespace, parametersToGenerate);
    createProcessedTemplate(
      templateDraft,
      cluster,
      namespace,
      excludedParameters,
      setTemplateWithGeneratedValues,
      setError,
      setLoading,
    );
  }, [namespace, template, cluster]);

  return [templateWithGeneratedValues, loading, error];
};

export default useVMTemplateGeneratedParams;
