import {
  isYAMLTemplate,
  type K8sModel,
  useResolvedExtensions,
  type YAMLTemplate,
} from '@openshift-console/dynamic-plugin-sdk';

import { type ResourceYAMLTemplate } from '../types';
import { convertResourceYAMLTemplate } from '../utils';

const useYAMLTemplateExtension = (
  model: K8sModel | null,
): { resourceYAMLTemplate: object | undefined; yamlExtensionsResolved: boolean } => {
  const [yamlExtensions, yamlExtensionsResolved] =
    useResolvedExtensions<YAMLTemplate>(isYAMLTemplate);

  // SDK extension template type doesn't align with ResourceYAMLTemplate; cast is required
  const resourceYAMLTemplate = yamlExtensions?.find(
    (ext) => ext.properties.model.kind === model?.kind,
  )?.properties?.template as ResourceYAMLTemplate;

  return {
    resourceYAMLTemplate: resourceYAMLTemplate
      ? convertResourceYAMLTemplate(resourceYAMLTemplate)
      : undefined,
    yamlExtensionsResolved,
  };
};

export default useYAMLTemplateExtension;
