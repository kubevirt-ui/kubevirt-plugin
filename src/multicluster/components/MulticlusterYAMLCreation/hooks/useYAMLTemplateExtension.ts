import {
  isYAMLTemplate,
  K8sModel,
  useResolvedExtensions,
  YAMLTemplate,
} from '@openshift-console/dynamic-plugin-sdk';

import { ResourceYAMLTemplate } from '../types';
import { convertResourceYAMLTemplate } from '../utils';

const useYAMLTemplateExtension = (model: K8sModel) => {
  const [yamlExtensions, yamlExtensionsResolved] =
    useResolvedExtensions<YAMLTemplate>(isYAMLTemplate);

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
