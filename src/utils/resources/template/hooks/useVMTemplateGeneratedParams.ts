import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { generateParamsWithPrettyName } from './../utils/helpers';

export default (template: V1Template): [template: V1Template, error: Error] => {
  const [error, setError] = useState<Error>();
  const { ns: namespace = DEFAULT_NAMESPACE } = useParams<{ ns: string }>();
  const [templateWithGeneratedValues, setTemplateWithGeneratedValues] = useState<V1Template>();

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

    if (parametersToGenerate.length === 0) return setTemplateWithGeneratedValues(template);

    k8sCreate<V1Template>({
      data: {
        ...template,
        metadata: { ...template?.metadata, namespace },
        parameters: parametersToGenerate,
      },
      model: ProcessedTemplatesModel,
      ns: namespace,
      queryParams: {
        dryRun: 'All',
      },
    })
      .then((processedTemplate) => {
        const mergedParameters = [...processedTemplate.parameters, ...excludedParameters];

        setTemplateWithGeneratedValues({
          ...template,
          parameters: mergedParameters,
        });
      })
      .catch(setError);
  }, [namespace, template]);

  return [templateWithGeneratedValues, error];
};
