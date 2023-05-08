import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';

import { eventSourceData } from './knative-topology-utils';

export const isDynamicEventResourceKind = (resourceRef: string): boolean => {
  const index = eventSourceData.eventSourceModels.findIndex(
    (model: K8sKind) => modelToRef(model) === resourceRef,
  );
  return index !== -1;
};
