import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getHardFieldKeys, isNamespacedQuota } from '../../utils/utils';
import { SCOPE } from '../constants';
import { ApplicationAwareQuota, VirtualizationQuota } from '../types';

export const fromYaml = (
  yaml: ApplicationAwareQuota,
  isDedicatedVirtualResources: boolean,
): VirtualizationQuota => {
  if (isNamespacedQuota(yaml)) {
    const { cpu, memory, vmCount } = getHardFieldKeys(isDedicatedVirtualResources);

    const cpuLimit = yaml.spec?.hard[cpu] ? parseInt(yaml.spec.hard[cpu]) : undefined;
    const memoryLimit = yaml.spec?.hard[memory] ? parseInt(yaml.spec.hard[memory]) : undefined;
    const vmCountLimit = yaml.spec?.hard[vmCount] ? parseInt(yaml.spec.hard[vmCount]) : undefined;

    return {
      cpuLimit,
      memoryLimit,
      name: yaml.metadata.name,
      namespace: yaml.metadata.namespace,
      scope: SCOPE.project,
      vmCountLimit,
    };
  }

  const labels = yaml.spec.selector?.labels?.matchLabels ?? {};

  return {
    labelSelectors: Object.entries(labels).map(([key, value], index) => ({
      id: index,
      key,
      value,
    })),
    name: yaml.metadata.name,
    projects: yaml.spec.selector?.labels?.matchExpressions?.[0]?.values,
    scope: SCOPE.cluster,
    useLabelSelectors: !isEmpty(labels),
  };
};
