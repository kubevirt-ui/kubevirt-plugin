import { type K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { type TopologyDataObject } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { type GraphElement } from '@patternfly/react-topology';

import type OdcBaseNode from '../components/ODCBaseNode';

export const getTopologyResourceObject = (topologyObject: TopologyDataObject): K8sResourceKind => {
  if (!topologyObject) {
    return null;
  }
  return topologyObject.resource ?? topologyObject.resources?.obj;
};

export const getResource = <T = K8sResourceKind>(node: GraphElement): T => {
  const resource = (node as OdcBaseNode)?.getResource();
  return (resource as T) || (getTopologyResourceObject(node?.getData()) as T);
};
