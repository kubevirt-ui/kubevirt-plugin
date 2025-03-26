import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { OdcNodeModel } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { Model } from '@patternfly/react-topology';

import { TYPE_VIRTUAL_MACHINE } from './constants';

export const isKubevirtResource = (resource: K8sResourceKind, model: Model): boolean => {
  if (!model?.nodes?.length) {
    return false;
  }
  return !!model.nodes.find((node) => {
    if (node.type !== TYPE_VIRTUAL_MACHINE) {
      return false;
    }
    return (node as OdcNodeModel).resource?.metadata?.uid === resource?.metadata?.uid;
  });
};
