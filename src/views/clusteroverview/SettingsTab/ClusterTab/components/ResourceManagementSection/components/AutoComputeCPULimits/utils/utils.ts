import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const addLabelsToHyperConvergedCR = (hcoCR: HyperConverged, idLabels: IDLabel[]) => {
  const labels = idLabels?.reduce((acc, idLabel) => {
    acc[idLabel?.key] = idLabel?.value?.replaceAll('/', '~1');
    return acc;
  }, {});

  return k8sPatch<HyperConverged>({
    data: [
      {
        op: 'replace',
        path: '/spec/resourceRequirements/autoCPULimitNamespaceLabelSelector',
        value: labels ? { matchLabels: labels } : null,
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });
};

export const removeLabelsFromHyperConvergedCR = (hcoCR: HyperConverged) => {
  return k8sPatch<HyperConverged>({
    data: [
      {
        op: 'remove',
        path: '/spec/resourceRequirements/autoCPULimitNamespaceLabelSelector',
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });
};
