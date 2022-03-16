import { load, dump } from 'js-yaml';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const appendYAMLString = (currentYAML: string, yaml: K8sResourceCommon) => {
  return !currentYAML
    ? yaml
    : `${currentYAML}${currentYAML.trim().endsWith('---') ? '\n' : '\n---\n'}${yaml}`;
};

export const convertObjectToYaml = ({
  obj,
  currentYAML,
  allowMultiple,
}: {
  obj: K8sResourceCommon;
  currentYAML?: string;
  allowMultiple?: boolean;
}): string => {
  let yaml: any = '';
  if (obj) {
    if (obj !== null && typeof obj.valueOf() === 'string') {
      yaml = allowMultiple ? appendYAMLString(currentYAML, obj) : obj;
    } else {
      yaml = dump(obj);
    }
  }
  return yaml;
};

export const convertYAMLToObject = (yaml: string) => load(yaml);
