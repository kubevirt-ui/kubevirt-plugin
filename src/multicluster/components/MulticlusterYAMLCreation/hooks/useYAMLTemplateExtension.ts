import { load } from 'js-yaml';

import {
  isYAMLTemplate,
  K8sModel,
  useResolvedExtensions,
  YAMLTemplate,
} from '@openshift-console/dynamic-plugin-sdk';

const useYAMLTemplateExtension = (model: K8sModel) => {
  const [yamlExtensions, yamlExtensionsResolved] =
    useResolvedExtensions<YAMLTemplate>(isYAMLTemplate);

  const resourceYAMLTemplate = yamlExtensions?.find(
    (ext) => ext.properties.model.kind === model?.kind,
  )?.properties?.template as (() => string) | string;

  return {
    resourceYAMLTemplate: resourceYAMLTemplate
      ? load(
          typeof resourceYAMLTemplate === 'function'
            ? resourceYAMLTemplate()
            : resourceYAMLTemplate,
        )
      : undefined,
    yamlExtensionsResolved,
  };
};

export default useYAMLTemplateExtension;
