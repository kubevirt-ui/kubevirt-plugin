import * as React from 'react';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

/**
 * A Hook that processes a given template and returns the processed template.
 * @param {V1Template} template V1Template to process
 * @param {string} namespace Namespace to process the template in
 * @returns the processed template.
 */
export const useProcessedTemplate = (
  template: V1Template,
  namespace: string,
): [V1Template, boolean, any] => {
  const [processedTemplate, setProcessedTemplate] = React.useState<V1Template | undefined>(
    undefined,
  );
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<any>();

  React.useEffect(() => {
    setLoaded(false);

    if (template) {
      k8sCreate<V1Template>({
        model: ProcessedTemplatesModel,
        data: { ...template, metadata: { ...template?.metadata, namespace } },
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
