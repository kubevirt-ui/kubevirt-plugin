import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';

import { eventSourceData } from '../knative-topology-utils';

export const getDynamicChannelModelRefs = (): string[] => {
  return eventSourceData.eventSourceChannels.map((model: K8sKind) => modelToRef(model));
};
