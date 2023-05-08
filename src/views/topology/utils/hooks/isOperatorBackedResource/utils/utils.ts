import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';

interface EventSourceData {
  loaded: boolean;
  eventSourceModels: K8sKind[];
  eventSourceChannels?: K8sKind[];
}

const eventSourceData: EventSourceData = {
  loaded: false,
  eventSourceModels: [],
  eventSourceChannels: [],
};

export const getDynamicEventSourcesModelRefs = (): string[] => {
  return eventSourceData.eventSourceModels.map((model: K8sKind) => modelToRef(model));
};
