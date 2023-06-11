import { useEffect, useState } from 'react';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { generateParamsWithPrettyName } from './../utils/helpers';

/**
 * A Hook that processes a given template and returns the processed template.
 * @param {V1Template} template V1Template to process
 * @param {string} namespace Namespace to process the template in
 * @returns the processed template.
 */
export const useProcessedTemplate = (
  template: V1Template,
  namespace: string = DEFAULT_NAMESPACE,
): [V1Template, boolean, any] => {
  const [processedTemplate, setProcessedTemplate] = useState<undefined | V1Template>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<any>();
  useEffect(() => {
    setLoaded(false);

    if (template) {
      const parameters = generateParamsWithPrettyName(template);
      k8sCreate<V1Template>({
        data: {
          ...template,
          metadata: { ...template?.metadata, namespace },
          parameters,
        },
        model: ProcessedTemplatesModel,
        ns: namespace,
        queryParams: {
          dryRun: 'All',
        },
      })
        .then((temp) => {
          setProcessedTemplate(temp);
          setLoaded(true);
        })
        .catch((err) => {
          setProcessedTemplate(undefined);
          setLoaded(true);
          setError(err);
        });
    }
  }, [template, namespace]);

  return [processedTemplate, loaded, error];
};
