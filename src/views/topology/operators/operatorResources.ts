import { referenceForModel } from '@console/internal/module/k8s';
import { ServiceBindingModel } from '@console/service-binding-plugin/src/models';
import ClusterServiceVersionModel from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import { WatchK8sResources } from '@openshift-console/dynamic-plugin-sdk';

export const getOperatorWatchedResources = (namespace: string): WatchK8sResources<any> => {
  return {
    clusterServiceVersions: {
      isList: true,
      kind: referenceForModel(ClusterServiceVersionModel),
      namespace,
      optional: true,
    },
  };
};

export const getServiceBindingWatchedResources = (namespace: string): WatchK8sResources<any> => {
  return {
    serviceBindingRequests: {
      isList: true,
      kind: referenceForModel(ServiceBindingModel),
      namespace,
      optional: true,
    },
  };
};
