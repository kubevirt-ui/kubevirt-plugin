import { safeYAMLToJS } from '@kubevirt-utils/utils/yaml';

import { type ResourceYAMLTemplate } from './types';

export const convertResourceYAMLTemplate = (resourceYAMLTemplate: ResourceYAMLTemplate): object => {
  if (typeof resourceYAMLTemplate === 'function') {
    const result = resourceYAMLTemplate();
    if (typeof result === 'string') {
      return safeYAMLToJS<object>(result, {});
    }
    return result;
  }

  return safeYAMLToJS<object>(resourceYAMLTemplate, {});
};
