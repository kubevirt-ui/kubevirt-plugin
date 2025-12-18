import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { generateParamsWithPrettyName } from './../utils/helpers';

export default (template: V1Template): [template: V1Template, loading: boolean, error: Error] => {
  const cluster = useClusterParam();
  const [error, setError] = useState<Error>();
  const { ns: namespace = DEFAULT_NAMESPACE } = useParams<{ ns: string }>();
  const [templateWithGeneratedValues, setTemplateWithGeneratedValues] = useState<V1Template>();
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

    if (parametersToGenerate.length === 0) {
      setError(null);
      setTemplateWithGeneratedValues({ ...template, parameters });
      return;
    }
    setLoading(true);
    kubevirtK8sCreate<V1Template>({
      cluster,
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
        setError(null);
        setLoading(false);
      })
      .catch((apiError) => {
        setTemplateWithGeneratedValues(template);
        setError(apiError);
        setLoading(false);
      });
  }, [namespace, template, cluster]);

  return [templateWithGeneratedValues, loading, error];
};
