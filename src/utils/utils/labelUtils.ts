import { getLabels } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { universalComparator } from './sortingUtils';

export const getLabelsAsString = (obj: K8sResourceCommon): string[] => {
  const labels = getLabels(obj) ?? {};

  return Object.entries(labels)
    .sort(([aKey], [bKey]) => universalComparator(aKey, bKey))
    .map(([key, value]) => `${key}=${value}`);
};

export const labelParser = (resources?: K8sResourceCommon[]): Set<string> =>
  (resources ?? []).reduce((acc, resource) => {
    for (const label of getLabelsAsString(resource)) {
      acc.add(label);
    }
    return acc;
  }, new Set<string>());
