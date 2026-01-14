import { load } from 'js-yaml';

import { ResourceYAMLTemplate } from './types';

export const convertResourceYAMLTemplate = (resourceYAMLTemplate: ResourceYAMLTemplate): object => {
  if (typeof resourceYAMLTemplate === 'function') {
    const result = resourceYAMLTemplate();
    if (typeof result === 'string') {
      return load(result) as object;
    }
    return result;
  }

  return load(resourceYAMLTemplate) as object;
};
