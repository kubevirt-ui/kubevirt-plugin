import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { OdcNodeModel } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { Model } from '@patternfly/react-topology';

import { isVMType } from './utils';

export const isKubevirtResource = (resource: K8sResourceKind, model: Model): boolean => {
  if (!model?.nodes?.length) return false;

  return !!model.nodes.find((node) => {
    if (!isVMType(node.type)) return false;

    return (node as OdcNodeModel).resource?.metadata?.uid === resource?.metadata?.uid;
  });
};
