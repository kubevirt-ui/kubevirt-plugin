import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  OperatorGroupModel,
  PackageManifestModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getGroupVersionKindForModel, Operator } from '@openshift-console/dynamic-plugin-sdk';

export const getWatchedOperatorResources = (cluster?: string) => ({
  clusterServiceVersions: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(ClusterServiceVersionModel),
    isList: true,
  },
  marketplacePackageManifests: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
  },
  operatorGroups: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(OperatorGroupModel),
    isList: true,
  },
  packageManifests: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: 'opsrc-owner-name',
          operator: Operator.DoesNotExist,
        },
        { key: 'csc-owner-name', operator: Operator.DoesNotExist },
      ],
    },
  },
  subscriptions: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(SubscriptionModel),
    isList: true,
  },
});
