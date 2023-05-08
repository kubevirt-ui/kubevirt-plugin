import { TopologyDataResources } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';

import { K8sResourceKind } from '../../../../clusteroverview/utils/types';
import { CAMEL_SOURCE_INTEGRATION } from '../../knative/knative-const';
import { getKnativeDynamicResources } from '../../knative-topology-utils';

import { getDynamicEventSourcesModelRefs } from './utils/utils';

const isOperatorBackedKnResource = (obj: K8sResourceKind, resources: TopologyDataResources) => {
  const eventSourceProps = getDynamicEventSourcesModelRefs();
  return !!getKnativeDynamicResources(resources, eventSourceProps)?.find((evsrc) =>
    obj.metadata?.labels?.[CAMEL_SOURCE_INTEGRATION]?.startsWith(evsrc.metadata.name),
  );
};

export default isOperatorBackedKnResource;
